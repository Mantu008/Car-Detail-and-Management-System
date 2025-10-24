import api from '../config/api';

class ActivityLogger {
    static logActivity = async (action, entityType, entityId, details = {}) => {
        try {
            const activity = {
                action, // 'create', 'update', 'delete', 'view'
                entityType, // 'car', 'service', 'user'
                entityId,
                details,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            // Send to backend
            await api.post('/api/activities', activity);
            
            // Also store in localStorage for offline tracking
            const localActivities = JSON.parse(localStorage.getItem('activities') || '[]');
            localActivities.push(activity);
            localStorage.setItem('activities', JSON.stringify(localActivities));
            
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Store locally if backend fails
            const localActivities = JSON.parse(localStorage.getItem('activities') || '[]');
            localActivities.push({
                ...activity,
                offline: true
            });
            localStorage.setItem('activities', JSON.stringify(localActivities));
        }
    };

    static getActivities = async (filters = {}) => {
        try {
            const response = await api.get('/api/activities', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            // Return local activities if backend fails
            return JSON.parse(localStorage.getItem('activities') || '[]');
        }
    };

    static getActivityStats = async () => {
        try {
            const response = await api.get('/api/activities/stats');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch activity stats:', error);
            return {
                totalActivities: 0,
                todayActivities: 0,
                topActions: [],
                topUsers: []
            };
        }
    };

    // Helper methods for common activities
    static logCarCreated = (carId, carDetails) => {
        return this.logActivity('create', 'car', carId, {
            brand: carDetails.brand,
            model: carDetails.model,
            year: carDetails.year
        });
    };

    static logCarUpdated = (carId, oldData, newData) => {
        return this.logActivity('update', 'car', carId, {
            changes: this.getChanges(oldData, newData)
        });
    };

    static logCarDeleted = (carId, carDetails) => {
        return this.logActivity('delete', 'car', carId, {
            brand: carDetails.brand,
            model: carDetails.model,
            year: carDetails.year
        });
    };

    static logServiceAdded = (serviceId, carId, serviceDetails) => {
        return this.logActivity('create', 'service', serviceId, {
            carId,
            serviceType: serviceDetails.serviceType,
            cost: serviceDetails.cost
        });
    };

    static logServiceUpdated = (serviceId, oldData, newData) => {
        return this.logActivity('update', 'service', serviceId, {
            changes: this.getChanges(oldData, newData)
        });
    };

    static logServiceDeleted = (serviceId, serviceDetails) => {
        return this.logActivity('delete', 'service', serviceId, {
            serviceType: serviceDetails.serviceType,
            cost: serviceDetails.cost
        });
    };

    static logUserLogin = (userId, userDetails) => {
        return this.logActivity('login', 'user', userId, {
            email: userDetails.email,
            role: userDetails.role
        });
    };

    static logUserLogout = (userId, userDetails) => {
        return this.logActivity('logout', 'user', userId, {
            email: userDetails.email,
            role: userDetails.role
        });
    };

    static logReportGenerated = (reportType, filters = {}) => {
        return this.logActivity('generate_report', 'report', null, {
            reportType,
            filters
        });
    };

    static getChanges = (oldData, newData) => {
        const changes = {};
        Object.keys(newData).forEach(key => {
            if (oldData[key] !== newData[key]) {
                changes[key] = {
                    from: oldData[key],
                    to: newData[key]
                };
            }
        });
        return changes;
    };
}

export default ActivityLogger;
