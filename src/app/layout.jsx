'use client'
import { useState, useEffect, createContext } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header1 from "@/components/header/header1";
import Header2 from "@/components/header/header2";
import Footer from "@/components/footer/footer";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Providers from "@/store/Provider";

// Import Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});
export const UserContext = createContext();

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const[userType, setUserType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          setFirstName(decodedToken.firstName || "User");
          setProfilePicture(decodedToken.profilePicture);
          setUserType(decodedToken.userType);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Failed to decode token:", error);
          setFirstName("User");
        }
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false);
    };
    
    const monitorToken = () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
         const expiry = decodedToken.exp;
         if(expiry < Date.now() / 1000){
           Cookies.remove('token');
           localStorage.removeItem('token');
           document.dispatchEvent(new Event("authChange"));
         }
        } catch (error) {
          console.error("Failed to decode token:", error);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    
    setInterval(monitorToken, 60 * 1000);

    // Listen to the custom event
    document.addEventListener("authChange", handleAuthChange);
  
    // Initial check
    handleAuthChange();
  
    return () => document.removeEventListener("authChange", handleAuthChange); // Cleanup
  }, []);

  const userContextValue = {
    isLoggedIn,
    firstName,
    profilePicture,
    userType,
  };

  return (
    <Providers>
      <html lang="en" className={`${poppins.variable} font-sans`}>
        <body className="antialiased">
         
         {loading ? (<></>) : (<>  {isLoggedIn ? (
            <Header2 firstName={firstName} profilePicture={profilePicture} userType={userType} />
          ) : (
            <Header1 />
          )}
              <UserContext.Provider value={userContextValue}>
                <main>{children}</main>
              </UserContext.Provider>
          <Footer /></>)}
        
        </body>
      </html>
    </Providers>
  );
}