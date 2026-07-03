import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const config = {

    success: {
        icon: CheckCircle,
        bg: 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600',
        text: 'text-green-800 dark:text-green-300',
        iconColor: 'text-green-500 dark:text-green-400',
    },
    error: {
        icon: XCircle,
        bg: 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600',
        text: 'text-red-800 dark:text-red-300',
        iconColor: 'text-red-500 dark:text-red-400',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600',
        text: 'text-blue-800 dark:text-blue-300',
        iconColor: 'text-blue-500 dark:text-blue-400',
    },
};

function Toast({ type, message, onClose }) {
    const { icon: Icon, bg, text, iconColor } = config[type] || config.info;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg ${bg} animate-slide-in`}>
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
            <span className={`flex-1 text-sm font-medium ${text}`}>{message}</span>
            <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
export default Toast;