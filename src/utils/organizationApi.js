import API from './api';
import toast from 'react-hot-toast';

export const updateField = async (organizationId, field, value, setSavingField) => {
    try {
        setSavingField(field);

        const response = await API.patch(`/organizations/${organizationId}/field`, {
            field,
            value,
        });

        if (response.success) {
            toast.success('Updated successfully!');
            return true;
        } else {
            throw new Error(response.message || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating field:', error);
        toast.error('Failed to update field');
        return false;
    } finally {
        setSavingField(null);
    }
};

export const updateArrayField = async (organizationId, field, value, setSavingField) => {
    try {
        setSavingField(field);

        const response = await API.patch(`/organizations/${organizationId}/field`, {
            field,
            value,
        });

        if (response.success) {
            toast.success('Updated successfully!');
            return true;
        } else {
            throw new Error(response.message || 'Update failed');
        }
    } catch (error) {
        console.error('Error updating array field:', error);
        toast.error('Failed to update');
        return false;
    } finally {
        setSavingField(null);
    }
};