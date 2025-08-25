import { ApiService } from './apiService';

export const trackPageView = async (path: string) => {
    try {
        // Get the IP address from our backend (which avoids CORS issues)
        let ip_address = 'Unknown';
        
        try {
            const ipResponse = await ApiService.get<{ ip: string }>('/authentication/get_client_ip/');
            ip_address = ipResponse.ip;
        } catch (ipError) {
            // If IP lookup fails, continue with 'Unknown'
            console.debug('IP lookup failed, continuing without IP tracking');
        }

        // Send both the path and IP to your endpoint using the API service
        await ApiService.trackPageView(path, ip_address);
    } catch (error) {
        // Silently fail for tracking - don't log errors to avoid console spam
        // This is a non-critical feature that shouldn't affect user experience
    }
};

