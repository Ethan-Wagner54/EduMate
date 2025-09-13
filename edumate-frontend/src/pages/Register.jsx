import {useState} from "react";
import logoImage from '../assets/edumateLogo.jpg';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function Registration() //main registration component
{
    //state to manage form data
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '', academicLevel: '', modules: [] });

    //modules and academic level options
    const moduleOptions = ["Mathematics", "Computer Science", "Physics", "Economics", "Chemistry", "Other"];
    const academicLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Honours Student", "Master's Student", "PhD Student", "Postdoctoral Researcher"];

    //handle input changes for text fields and dropdowns
    const handleChange = (e) => 
    {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }; 

    //toggle module selection (checkbox logic)
    const handleModuleToggle = (module) => 
    {
        setFormData(prev => 
        {
            const modules = prev.modules.includes(module)
            ? prev.modules.filter(m => m !== module)
            : [...prev.modules, module];
            return { ...prev, modules };
        });
    };

    //handle form submission
    const handleSubmit = (e) =>
    {
        e.preventDefault();
        if(formData.password !== formData.confirmPassword)
        {
            alert("Passwords do not match");
            return;
        }
        console.log("Registration data:", formData);

        // TO DO: Connect to back-end API here
    };

    //layout for the page
    return (
         <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 py-8 px-4 flex items-center justify-center">
            <Card className="w-full max-w-3xl bg-card dark:bg-card-dark border border-border dark:border-border-dark backdrop-blur-sm">
                {/* Logo and header */}
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <img src={logoImage} alt="EduMate Logo" className="w-20 h-20" />
                    </div>
                    <CardTitle className="text-3xl text-foreground dark:text-foreground-dark">
                        Create Your EduMate Account
                     </CardTitle>
                </CardHeader>
                {/* Registration form */}
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                         {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label>I want to...</Label>
                            <div className="flex gap-4">
                                {["Student", "Tutor", "Both"].map(role => (
                                    <label
                                        key={role}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 ${
                                            formData.role == role
                                                ? "bg-primary border-primary text-white" //ADD OR REMOVE TABBING
                                                : "border-white text-white"
                                        } cursor-pointer`}
                                    >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={formData.role === role}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    {role}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/*Academic Level Dropdown */}
                        <div className="space-y-2">
                            <Label htmlFor="academicLevel">Current Academic Level</Label>
                            <select
                                id="academicLevel"
                                name="academicLevel"
                                value={formData.academicLevel}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded bg-input dark:bg-input-dark border border-border dark:border-border-dark text-foreground dark:text-foreground-dark"
                            >
                                <option value="">Select your level</option>
                                {academicLevels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
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
                                                ? "bg-primary text-white border-primary" //ADD OR REMOVE TABBING
                                                : "bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark border-border dark:border-border-dark"
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
                        </div>
                        {/*Submit Button*/}
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
                        <button className="text-secondary dark:text-secondary-dark hover:underline">
                            Sign In
                        </button>
                    </p>
                    <p className="mt-2">
                        By registering, you agree to our{" "}
                        <button className="text-primary hover:underline">Terms of Service</button>{" "}
                        and{" "}
                        <button className="text-primary hover:underline">Privacy Policy</button>.
                    </p>
                </div>
                </CardContent>
            </Card>
        </div>
    );
}