using Microsoft.EntityFrameworkCore;
using TechStore.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Ponto de entrada da aplicação. É aqui que todos os serviços (banco de dados,
// autenticação, controllers, CORS, etc.) são registrados e configurados
// antes da API começar a rodar.
var builder = WebApplication.CreateBuilder(args);

// Registra o suporte a Controllers (as classes dentro de /Controllers,
// como ProdutosController, AuthController, etc.) para que o ASP.NET Core
// saiba rotear requisições HTTP para elas.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Evita erro de "referência circular" ao serializar objetos em JSON.
        // Exemplo: Produto tem Categoria, e Categoria tem uma lista de Produtos —
        // sem essa opção, o JSON entraria em loop infinito (Produto -> Categoria -> Produtos -> Categoria -> ...).
        // Com IgnoreCycles, o serializador simplesmente "corta" a referência repetida.
        options.JsonSerializerOptions.ReferenceHandler = 
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Registra o AppDbContext (nossa "porta de entrada" para o banco de dados via Entity Framework Core)
// como um serviço injetável em qualquer controller. UseNpgsql configura o Entity Framework
// para falar com um banco PostgreSQL, usando a string de conexão definida em appsettings.json
// (procurada pela chave "DefaultConnection").
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Habilita a geração automática de documentação da API (necessário para o Swagger funcionar).
builder.Services.AddEndpointsApiExplorer();

// Registra o Swagger, que gera uma interface visual (acessível em /swagger) para testar
// os endpoints da API manualmente, sem precisar de Postman ou frontend.
builder.Services.AddSwaggerGen();

// Chave secreta usada para assinar e validar os tokens JWT gerados no login.
// ATENÇÃO: em produção, isso NUNCA deveria estar direto no código — o ideal é
// mover para uma variável de ambiente ou para o appsettings.json (fora do controle de versão).
var chaveJwt = "ChaveSecretaMuitoSeguraTechStore2026!";

// Configura o sistema de autenticação da API para usar JWT Bearer Token como método padrão.
// Isso significa: toda rota marcada com [Authorize] vai exigir um token JWT válido
// no cabeçalho "Authorization: Bearer {token}" da requisição.
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Regras que o ASP.NET Core usa para validar se um token recebido é confiável.
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,     // Não estamos validando quem emitiu o token (simplificação para projeto pequeno)
        ValidateAudience = false,   // Não estamos validando para quem o token foi destinado
        ValidateLifetime = true,    // MAS validamos se o token já expirou (essencial: rejeita tokens vencidos)
        ValidateIssuerSigningKey = true, // Garante que o token foi assinado com a MESMA chave que geramos aqui

        // A mesma chave usada para assinar o token no login (AuthController) precisa
        // ser usada aqui para validar — é como conferir se a "assinatura" bate com a original.
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chaveJwt))
    };
});

// Habilita o sistema de autorização (o [Authorize] nos controllers só funciona
// porque esse serviço foi registrado).
builder.Services.AddAuthorization();

// Configura o CORS (Cross-Origin Resource Sharing) — necessário porque o frontend
// (rodando em localhost:5173) e o backend (rodando em localhost:5243) são "origens"
// diferentes do ponto de vista do navegador. Sem essa configuração, o navegador
// bloquearia as requisições do frontend para a API por segurança.
builder.Services.AddCors(options =>
{
    // Cria uma política chamada "PermitirTudo" (nome escolhido por nós, usado mais abaixo).
    options.AddPolicy("PermitirTudo", policy =>
    {
        policy.AllowAnyOrigin()   // Aceita requisições vindas de QUALQUER domínio/porta
              .AllowAnyMethod()   // Aceita qualquer verbo HTTP (GET, POST, PUT, DELETE...)
              .AllowAnyHeader();  // Aceita qualquer cabeçalho customizado na requisição
        // OBS: "PermitirTudo" é adequado para desenvolvimento, mas em produção
        // o ideal é restringir para o domínio real do frontend (AllowAnyOrigin é arriscado).
    });
});

// A partir daqui, o "builder" (fase de configuração) se transforma em "app" (fase de execução).
// Depois desse ponto, não é mais possível registrar novos serviços com builder.Services.
var app = builder.Build();

// Swagger só é habilitado quando a aplicação está rodando em ambiente de desenvolvimento
// (não em produção), por segurança — não queremos expor a documentação/interface de testes
// da API para qualquer pessoa que acesse o site em produção.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();     // Gera o arquivo de especificação da API (JSON) 
    app.UseSwaggerUI();   // Gera a interface visual para testar os endpoints (acessível em /swagger)
}

// A ORDEM dos "app.Use..." importa muito aqui — cada um é um "filtro" pelo qual
// toda requisição passa, em sequência, antes de chegar no controller.

// 1º: Aplica a política de CORS definida acima — permite que o navegador aceite
// a resposta da API mesmo vindo de outra origem (o frontend).
app.UseCors("PermitirTudo");

// 2º: Verifica se a requisição tem um token JWT válido (quem é o usuário).
app.UseAuthentication();

// 3º: Verifica se esse usuário TEM PERMISSÃO de acessar a rota pedida
// (funciona em conjunto com os atributos [Authorize] nos controllers).
app.UseAuthorization();

// Ativa o roteamento: a partir daqui, o ASP.NET Core sabe direcionar cada requisição
// HTTP para o método correto dentro dos Controllers (baseado nas rotas [Route], [HttpGet], etc.)
app.MapControllers();

// Inicia o servidor web e começa a "escutar" requisições HTTP.
app.Run();