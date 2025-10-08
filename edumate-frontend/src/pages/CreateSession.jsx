import { useState, useEffect, useRef } from "react";
import {Calendar, Clock, MapPin, User, BookOpen, DollarSign, FileText, AlertCircle, CheckCircle, Loader} from "lucide-react";
import { Button } from "../components/ui/button"; 
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Link, useNavigate } from "react-router-dom";
import sessionService from '../services/sessions/session';
import moduleService from '../services/modules/modules';
import authService from '../services/auth/auth';

export default function CreateSession()
{
    const navigate = useNavigate();
    const formRef = useRef(null);
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
        description: "",
        makeVisible: true // Default to making sessions visible
    });

    // Load tutor-specific modules on component mount
    useEffect(() => {
        const fetchModules = async () => {
            try {
                setModulesLoading(true);
                const response = await moduleService.getTutorModules();
                if (response.success && response.data) {
                    if (response.data.length === 0) {
                        setError('You have no approved teaching modules. Please contact the administrator to get modules approved for you.');
                    } else {
                        setModules(response.data);
                    }
                } else {
                    setError('Failed to load your teaching modules. Please contact admin if you should have access to modules.');
                }
            } catch (err) {
                setError('Failed to load your teaching modules. Please try refreshing the page.');
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
    
    // Clear form function
    const clearForm = () => {
        if (formRef.current) {
            formRef.current.reset();
        }
        setFormData({
            moduleId: "",
            date: "",
            startTime: "",
            endTime: "",
            location: "",
            capacity: "",
            description: "",
            makeVisible: true
        });
        setError('');
    };

    //Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.moduleId || !formData.date || !formData.startTime || !formData.endTime || !formData.description?.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        // Debug logging (removed for cleaner console)
        
        // Combine date and time
        let startDateTime, endDateTime;
        try {
            // Ensure time format includes seconds for proper parsing
            const startTimeWithSeconds = formData.startTime.includes(':') && formData.startTime.split(':').length === 2 
                ? `${formData.startTime}:00` 
                : formData.startTime;
            const endTimeWithSeconds = formData.endTime.includes(':') && formData.endTime.split(':').length === 2 
                ? `${formData.endTime}:00` 
                : formData.endTime;
            
            startDateTime = new Date(`${formData.date}T${startTimeWithSeconds}`);
            endDateTime = new Date(`${formData.date}T${endTimeWithSeconds}`);
            
            // Check if dates are valid
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                throw new Error('Invalid date/time combination');
            }
        } catch (err) {
            setError('Invalid date or time format. Please check your inputs.');
            return;
        }
        
        // Validate times
        if (endDateTime <= startDateTime) {
            setError('End time must be after start time');
            return;
        }
        
        // Validate that session is not in the past
        const now = new Date();
        if (startDateTime <= now) {
            setError('Session cannot be scheduled in the past');
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
                capacity: formData.capacity ? parseInt(formData.capacity) : null,
                description: formData.description.trim(),
                status: formData.makeVisible ? 'published' : 'draft' // Set status based on visibility toggle
            };

            const response = await sessionService.createSession(sessionData);
            
            if (response.success) {
                setSuccess('Session created successfully!');
                // Reset form
                if (formRef.current) {
                    formRef.current.reset();
                }
                setFormData({
                    moduleId: "",
                    date: "",
                    startTime: "",
                    endTime: "",
                    location: "",
                    capacity: "",
                    description: "",
                    makeVisible: true
                });
                
                // Redirect after a delay
                setTimeout(() => {
                    navigate('/tutor/sessions');
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
                    <p className="text-muted-foreground">Loading your teaching modules...</p>
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
                
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    {/* Module Selection */}
                    <div>
                        <Label htmlFor="module">Module *</Label>
                        <select
                            id="module"
                            value={formData.moduleId}
                            onChange={(e) => handleInputChange("moduleId", e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            required
                        >
                            <option value="">Select a module...</option>
                            {modules.map((module) => (
                                <option key={module.id} value={module.id.toString()}>
                                    {module.code} - {module.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <Label htmlFor="date">Date *</Label>
                        <input
                            id="date"
                            type="date"
                            value={formData.date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startTime">Start Time *</Label>
                            <input
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={formData.startTime || ""}
                                onChange={(e) => handleInputChange("startTime", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="endTime">End Time *</Label>
                            <input
                                id="endTime"
                                name="endTime"
                                type="time"
                                value={formData.endTime || ""}
                                onChange={(e) => handleInputChange("endTime", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
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

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Session Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what will be covered in this session (e.g., 'Introduction to React hooks and state management')"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            rows={3}
                            className="resize-none"
                            required
                        />
                    </div>

                    {/* Session Visibility */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Make visible to students</Label>
                            <p className="text-sm text-muted-foreground">When enabled, students can see and join this session immediately</p>
                        </div>
                        <Switch
                            defaultChecked={formData.makeVisible}
                            onChange={(checked) => handleInputChange("makeVisible", checked)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
                        <Button 
                            type="button" 
                            onClick={clearForm}
                            className="flex-1"
                            variant="outline"
                        >
                            Clear Form
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader className="animate-spin h-4 w-4 mr-2" />
                                    Creating Session...
                                </>
                            ) : (
                                'Create Session'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}




