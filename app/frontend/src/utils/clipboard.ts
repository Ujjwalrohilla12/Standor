import { toast } from 'sonner';

export const copyToClipboard = async (text: string, successMessage = 'Copied to clipboard'): Promise<boolean> => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            toast.success(successMessage);
            return true;
        } else {
            // Fallback for insecure context
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    toast.success(successMessage);
                    return true;
                } else {
                    toast.error('Failed to copy natively. Please copy manually.');
                    return false;
                }
            } catch (err) {
                toast.error('Failed to copy natively. Please copy manually.');
                console.error('Fallback: unable to copy', err);
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (err) {
        console.error('Failed to copy', err);
        toast.error('Failed to copy link.');
        return false;
    }
};
