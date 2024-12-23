import axios from 'axios';

export const trackPageView = async (path: string) => {
    try {
        await axios.post('http://api.dev.banbury.io/authentication/add_site_visitor_info', {
            path,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error tracking page view:', error);
    }
}; 