import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import logoImage from '../assets/edumateLogo.jpg';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import authService from '../services/auth/auth'; // Import our new auth service

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("student"); // student or tutor
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginData = { email: formData.email, password: formData.password };
      
      const response = await authService.login(loginData);
      
      if (response.success) {
        const userTypeFromResponse = authService.getUserRole();
        
        // Check if the user type matches the selected tab
        if (userType === "student" && userTypeFromResponse !== "student") {
          alert("This account is not a student account. Please select the correct user type.");
          localStorage.removeItem('token'); // Clear the token
          return;
        }
        if (userType === "tutor" && userTypeFromResponse !== "tutor") {
          alert("This account is not a tutor account. Please select the correct user type.");
          localStorage.removeItem('token'); // Clear the token
          return;
        }
        
        // Navigate based on actual user role
        if (userTypeFromResponse === "admin") {
          navigate("/admin");
        } else if (userTypeFromResponse === "tutor") {
          navigate("/tutor");
        } else {
          navigate("/student");
        }
        return;
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Service unavailable. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="EduMate Logo" className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your EduMate account
          </CardDescription>

          {/* Toggle Tutor / Student */}
          <div className="flex justify-center gap-4 mt-2">
            <Button
              variant={userType === "student" ? "default" : "outline"}
              onClick={() => setUserType("student")}
            >
              Student
            </Button>
            <Button
              variant={userType === "tutor" ? "default" : "outline"}
              onClick={() => setUserType("tutor")}
            >
              Tutor
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" onClick={handleLogin}>
              Sign In
            </Button>
          </form>

          <div className="text-center text-sm space-y-2">
            <Link 
              to="/forgot-password" 
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              Forgot your password?
            </Link>
            <p className="text-muted-foreground">
              Don't have an account? <Link to="/register" className="text-purple-600 hover:text-purple-800 hover:underline">Sign up</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
