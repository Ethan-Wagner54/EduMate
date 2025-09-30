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
  const [users, setUsers] = useState({ students: [], tutors: [], admins: [] });
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/mocks/users.json")
      .then(res => res.json())
      .then(setUsers)
      .catch(err => console.error("Failed to load users.json", err));
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    debugger;
    try {
      const loginData = { ...formData, userType };
      
      const response = await authService.login(loginData);
      
      if (response.success) {
        const userTypeFromResponse = authService.getUserRole();
        
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
    <div className="min-h-screen w-full bg-background dark:bg-background-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card dark:bg-card-dark border-border dark:border-border-dark backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="EduMate Logo" className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl text-foreground dark:text-foreground-dark">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">
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

          <p className="text-center text-sm text-muted-foreground dark:text-muted-foreground-dark">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
