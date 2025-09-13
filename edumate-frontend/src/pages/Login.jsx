import { useState } from "react";
import logoImage from '../assets/edumateLogo.jpg';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom"; {/*to link the log in and the sign up page*/}

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', formData);
  };

  return (
    <div className="min-h-screen w-full bg-background dark:bg-background-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card dark:bg-card-dark border-border dark:border-border-dark backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logoImage} alt="EduMate Logo" className="w-16 h-16" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl text-foreground dark:text-foreground-dark">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">
              Sign in to your EduMate account to continue your learning journey
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground dark:text-foreground-dark">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-input dark:bg-input-dark border-border dark:border-border-dark text-foreground dark:text-foreground-dark placeholder:text-muted-foreground dark:placeholder:text-muted-foreground-dark focus:ring-ring focus:border-primary dark:focus:border-primary-dark"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground dark:text-foreground-dark">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-input dark:bg-input-dark border-border dark:border-border-dark text-foreground dark:text-foreground-dark placeholder:text-muted-foreground dark:placeholder:text-muted-foreground-dark focus:ring-ring focus:border-primary dark:focus:border-primary-dark pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-muted-foreground-dark hover:text-foreground dark:hover:text-foreground-dark"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-muted-foreground dark:text-muted-foreground-dark">
                <input type="checkbox" className="rounded border-border dark:border-border-dark bg-input dark:bg-input-dark" />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-primary dark:text-primary-dark hover:text-primary-dark transition-colors">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary dark:bg-primary-dark hover:bg-primary-dark text-primary-foreground dark:text-primary-foreground-dark transition-colors"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center">
            <p className="text-muted-foreground dark:text-muted-foreground-dark">
              Don't have an account?{' '}
              {/*<button className="text-secondary dark:text-secondary-dark hover:text-secondary-dark transition-colors">
                Sign up
              </button>*/} {/*replaced sign up button with sign up link*/}
              <Link
                to="/Register"
                className="text-secondary dark:text-secondary-dark hover:text-secondary-dark transition-colors"
              >
                Sign up
              </Link> 
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-border dark:border-border-dark" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card dark:bg-card-dark px-2 text-muted-foreground dark:text-muted-foreground-dark">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="bg-input dark:bg-input-dark border-border dark:border-border-dark text-foreground dark:text-foreground-dark hover:bg-input hover:dark:bg-input-dark">
              Google
            </Button>
            <Button variant="outline" className="bg-input dark:bg-input-dark border-border dark:border-border-dark text-foreground dark:text-foreground-dark hover:bg-input hover:dark:bg-input-dark">
              Microsoft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
