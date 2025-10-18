import {useState} from "react";
import logoImage from '../assets/edumateLogo.jpg';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/auth/auth";

export default function Registration() {
    
    const navigate = useNavigate();
    //state to manage form data
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        role: '', 
        academicLevel: '', 
        modules: [] 
    });
    
    // New state for validation errors
    const [errors, setErrors] = useState({});
    
    //modules and academic level options
    const moduleOptions = ["Mathematics", "Computer Science", "Physics", "Economics", "Chemistry", "Other"];
    const academicLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Honours Student", "Master's Student", "PhD Student", "Postdoctoral Researcher"];

    //handle input changes for text fields and dropdowns
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        
        // Real-time email validation
        if (name === 'email' && value.trim()) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value.trim())) {
                setErrors(prev => ({ ...prev, email: "Please enter a valid email address (e.g., user@example.com)" }));
            } else {
                setErrors(prev => ({ ...prev, email: null }));
            }
        }
    };

    //toggle module selection (checkbox logic)
    const handleModuleToggle = (module) => {
        setFormData(prev => {
            const modules = prev.modules.includes(module)
            ? prev.modules.filter(m => m !== module)
            : [...prev.modules, module];
            return { ...prev, modules };
        });
        
        // Clear module error when selection changes
        if (errors.modules) {
            setErrors(prev => ({ ...prev, modules: null }));
        }
    };

    // Validate the form
    const validateForm = () => {
        const newErrors = {};
        
        // Check required fields
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        //if (!formData.role) newErrors.role = "Please select a role";
        if (!formData.academicLevel) newErrors.academicLevel = "Please select your academic level";
        if (formData.modules.length === 0) newErrors.modules = "Please select at least one module";
        
        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (formData.email && !emailRegex.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address (e.g., user@example.com)";
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else {
            // Check password requirements
            const hasMinLength = formData.password.length >= 8;
            const hasLetter = /[a-zA-Z]/.test(formData.password);
            const hasNumber = /[0-9]/.test(formData.password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
            
            if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecial) {
                newErrors.password = "Password must be at least 8 characters and contain at least one letter, one number, and one special character";
            }
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //handle form submission
    const handleSubmit = (e) => {

        e.preventDefault();
        
        // Validate the form before submission
        if (validateForm()) {
           authService.register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            academicLevel: formData.academicLevel,
            modules: formData.modules
        });

        window.alert("Registration successful!");
        navigate("/HomePage");
        }
    };

    //layout for the page
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 py-8 px-4 flex items-center justify-center">
            <Card style={{ backgroundColor: '#4B2A64' }} className="w-full max-w-4xl text-white border border-purple-700">
                {/* Logo and header */}
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <img src={logoImage} alt="EduMate Logo" className="w-20 h-20" />
                    </div>
                    <CardTitle className="text-3xl text-foreground dark:text-white font-bold">
                        Welcome to EduMate
                    </CardTitle>
                    <p>Join our community of learners and educators. Connect with peers, share knowledge, and grow together through collaborative learning.</p>
                </CardHeader>
                {/* Registration form */}
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input style={{ backgroundColor: '#3C1A4F' }} className="bg-edumatePurpleLight text-white placeholder:text-purple-200 border border-grey"
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                         {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input style={{ backgroundColor: '#3C1A4F' }} className="bg-edumatePurpleLight text-white placeholder:text-purple-200 border border-grey"
                                id="email"
                                name="email"
                                type="text"
                                placeholder="Enter your email (e.g., john@example.com)"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input style={{ backgroundColor: '#3C1A4F' }} className="bg-edumatePurpleLight text-white placeholder:text-purple-200 border border-grey"
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            <p className="text-xs text-purple-200">Must be at least 8 characters with a letter, number, and special character.</p>
                        </div>
                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input style={{ backgroundColor: '#3C1A4F' }} className="bg-edumatePurpleLight text-white placeholder:text-purple-200 border border-grey"
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>
                        {/* Role Selection */}
                        {/*<div className="space-y-2">
                            <Label>I want to...</Label>
                            <div className="flex gap-4">
                                {["Student", "Tutor", "Both"].map(role => (
                                    <label
                                        key={role}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 ${
                                            formData.role === role
                                                ? "bg-primary border-primary text-white" 
                                                : "border to-white text-white"
                                        } cursor-pointer`}
                                    >
                                    <input style={{ backgroundColor: '#3C1A4F' }} className="bg-edumatePurpleLight text-white placeholder:text-purple-200 border border-grey"
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={formData.role === role}
                                        onChange={handleChange}
                                    />
                                    {role}
                                    </label>
                                ))}
                            </div>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                        </div>*/}
                        {/*Academic Level Dropdown */}
                        <div className="space-y-2">
                            <Label htmlFor="academicLevel">Current Academic Level</Label>
                            <select 
                                id="academicLevel"
                                name="academicLevel"
                                value={formData.academicLevel}
                                onChange={handleChange}
                                required
                                style={{ backgroundColor: '#3C1A4F' }} className="w-full p-2 rounded bg-input bg-edumatePurpleLight text-white placeholder:text-purple-200 border border-grey"
                            >
                                <option value="">Select your level</option>
                                {academicLevels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                            {errors.academicLevel && <p className="text-red-500 text-sm mt-1">{errors.academicLevel}</p>}
                        </div>
                        {/*Module Interests*/}
                        <div className="space-y-2">
                            <Label>Module Interests</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {moduleOptions.map(module => (
                                    <label 
                                        key={module}
                                        className={`flex items-center gap-2 px-3 py-2 rounded border ${
                                            formData.modules.includes(module)
                                                ? "bg-primary text-white border-primary" 
                                                : "border to-white text-white"
                                        } cursor-pointer`}
                                    >
                                        <input 
                                            type="checkbox"
                                            checked={formData.modules.includes(module)}
                                            onChange={() => handleModuleToggle(module)}
                                            className="hidden"
                                        />
                                        {module}
                                    </label>
                                ))}
                            </div>
                            {errors.modules && <p className="text-red-500 text-sm mt-1">{errors.modules}</p>}
                        </div>
                        {/*Submit Button - Replaced Link with regular button for form submission*/}
                        <Button
                            type="submit"
                            className="w-full bg-primary dark:bg-primary-dark hover:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark transition-colors"
                        >
                            Register
                        </Button>
                    </form>
                    {/*Footer*/}
                    <div className="text-center mt-6 text-sm text-muted-foreground dark:text-muted-foreground-dark">
                        <p>
                            Already have an Account?{" "}
                            <Link to="/login" className="text-secondary dark:text-secondary-dark hover:underline font-bold">
                                Sign In
                            </Link>
                        </p>
                        <p className="mt-2">
                            By registering, you agree to our{" "}
                            <button type="button" className="text-primary hover:underline font-bold">Terms of Service</button>{" "}
                            and{" "}
                            <button type="button" className="text-primary hover:underline font-bold">Privacy Policy</button>.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}