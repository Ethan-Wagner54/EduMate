import { useState, useEffect } from "react";
import {Calendar, Clock, MapPin, User, BookOpen, DollarSign, FileText, AlertCircle, CheckCircle, Loader} from "lucide-react";
import { Button } from "../components/ui/button"; 
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger,SelectValue} from "../components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import sessionService from '../services/sessions/session';
import moduleService from '../services/modules/modules';
import authService from '../services/auth/auth';

export default function CreateSession()
{
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modulesLoading, setModulesLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({ // State to hold all form input values
        moduleId: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        capacity: "",
        description: ""
    });

    // Load modules on component mount
    useEffect(() => {
        const fetchModules = async () => {
            try {
                setModulesLoading(true);
                const response = await moduleService.getModules();
                if (response.success && response.data) {
                    setModules(response.data);
                } else {
                    setError('Failed to load modules');
                }
            } catch (err) {
                setError('Failed to load modules');
            } finally {
                setModulesLoading(false);
            }
        };

        fetchModules();
    }, []);

    // Check if user is a tutor
    useEffect(() => {
        const userRole = authService.getUserRole();
        if (userRole !== 'tutor') {
            navigate('/');
        }
    }, [navigate]);

    //Generic input handler to update form state
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    //Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.moduleId || !formData.date || !formData.startTime || !formData.endTime) {
            setError('Please fill in all required fields');
            return;
        }

        // Combine date and time
        const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
        
        // Validate times
        if (endDateTime <= startDateTime) {
            setError('End time must be after start time');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const sessionData = {
                moduleId: parseInt(formData.moduleId),
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                location: formData.location || null,
                capacity: formData.capacity ? parseInt(formData.capacity) : null
            };

            const response = await sessionService.createSession(sessionData);
            
            if (response.success) {
                setSuccess('Session created successfully!');
                // Reset form
                setFormData({
                    moduleId: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    location: "",
                    capacity: "",
                    description: ""
                });
                
                // Redirect after a delay
                setTimeout(() => {
                    navigate('/tutor-sessions');
                }, 2000);
            } else {
                setError(response.error || 'Failed to create session');
            }
        } catch (err) {
            setError('Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    if (modulesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <Loader className="animate-spin h-8 w-8 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading modules...</p>
                </div>
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto mt-10 p-6">
            <CardHeader>
                <CardTitle>Create a Tutoring Session</CardTitle>
                <CardDescription>Fill in the details below to schedule a session</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center">
                        <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                        <span className="text-destructive text-sm">{error}</span>
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-green-700 text-sm">{success}</span>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Module Selection */}
                    <div>
                        <Label htmlFor="module">Module *</Label>
                        <Select
                            value={formData.moduleId}
                            onValueChange={(value) => handleInputChange("moduleId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a module" />
                            </SelectTrigger>
                            <SelectContent>
                                {modules.map((module) => (
                                    <SelectItem key={module.id} value={module.id.toString()}>
                                        {module.code} - {module.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date */}
                    <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startTime">Start Time *</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => handleInputChange("startTime", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="endTime">End Time *</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => handleInputChange("endTime", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="e.g. Library Room 4 or Online via Zoom"
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                        />
                    </div>

                    {/* Capacity */}
                    <div>
                        <Label htmlFor="capacity">Capacity (Optional)</Label>
                        <Input
                            id="capacity"
                            type="number"
                            placeholder="Maximum number of students (leave empty for unlimited)"
                            value={formData.capacity}
                            onChange={(e) => handleInputChange("capacity", e.target.value)}
                            min="1"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                Creating Session...
                            </>
                        ) : (
                            'Create Session'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}




