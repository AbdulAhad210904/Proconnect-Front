"use client";

import { useState, useEffect } from "react";
import {
  updatePasswordService,
  updateDisableStatusService,
  updateDeleteStatusService,
  sendVerificationCodeService,
  verifyCodeService,
  sendOTP,
  verifyOTP,
  checkEmailVerificationStatusService,
  checkPhoneVerificationStatusService,
} from "../../../services/userServices";
import {
  getConnectedBrowsersService,
  disconnectSessionService,
} from "../../../services/sessionServices";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone } from "lucide-react";
import Cookies from "js-cookie";

export default function SettingsPage() {
  const router = useRouter();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState();
  const [emailVerified, setEmailVerified] = useState();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePasswordService({ currentPassword, newPassword });
      setSuccess("Password updated successfully!");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (
        err.message === "The current password is incorrect. Please try again."
      ) {
        setError(
          "The current password is incorrect. Please check and try again."
        );
      } else {
        // Handle other errors
        setError(
          err.response?.data?.message ||
            "An error occurred while updating the password."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDisableAccount = async () => {
    try {
      await updateDisableStatusService(); // Disable the account
      // Clear user session and logout
      Cookies.remove("token");
      router.push("/");
    } catch (error) {
      alert(error.message); // Show error if fails
    } finally {
      setShowDisableConfirm(false); // Close the confirmation modal
    }
  };
  const handleDeleteAccount = async () => {
    try {
      await updateDeleteStatusService(true); // Delete the account
      // Clear user session and logout
      Cookies.remove("token");
      router.push("/");
    } catch (error) {
      alert(error.message); // Show error if fails
    } finally {
      setShowDeleteConfirm(false); // Close the confirmation modal
    }
  };
  const handleSendEmailVerificationCode = async () => {
    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");
      await sendVerificationCodeService();
      setMessage("Verification code sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleVerifyEmailVerificationCode = async () => {
    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");
      await verifyCodeService( verificationCode);
      setMessage("Email verified successfully!");
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const fetchConnectedBrowsers = async () => {
    try {
      setLoading(true); // Start loading state
      const fetchedSessions = await getConnectedBrowsersService(); // Await the fetched data
      setSessions(fetchedSessions.sessions); // Update state with resolved data
      //console.log(fetchedSessions);
    } catch (error) {
      console.log("Error fetching connected browsers:", error.message);
    } finally {
      setLoading(false); // Stop loading state
    }
  };
  const fetchVerificationStatuses = async () => {
    try {
      const phoneStatus = await checkPhoneVerificationStatusService();

      if (phoneStatus === "Phone is verified") {
        setPhoneVerified(true);
      } else if (phoneStatus === "Phone is not verified") {
        setPhoneVerified(false);
      }
      const emailStatus = await checkEmailVerificationStatusService();

      if (emailStatus === "Email is verified") {
        setEmailVerified(true);
      } else if (emailStatus === "Email is not verified") {
        setEmailVerified(false);
      }
    } catch (error) {
      console.error("Error fetching verification statuses:", error.message);
    }
  };
  const disconnectSession = async (sessionId) => {
    try {
      const result = await disconnectSessionService(sessionId);
      console.log(result.message); // Should print: "Session disconnected"
      window.location.reload();
    } catch (error) {
      console.log(error.message);  // Handle error (if any)
    }
  };
  const handleSendPhoneVerificationCode = async () => {
    setLoading(true);
    setMessage("");
    try {
      const responseMessage = await sendOTP(phoneNumber);
      setMessage(responseMessage);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyPhoneVerificationCode = async () => {
    setLoading(true);
    setMessage("");
    try {
      const responseMessage = await verifyOTP(phoneNumber, verificationCode);
      setMessage(responseMessage);
      window.location.reload();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectedBrowsers();
    fetchVerificationStatuses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="bg-[#27aae2] py-16 sm:py-24 px-4 relative w-full overflow-hidden">
        <div className="hidden xl:flex absolute left-0 top-[27%] -translate-y-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full bg-black/10 z-0" />
        <div className="hidden xl:flex absolute right-[-30%] bottom-[-155%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full bg-black/10 z-0" />
        <div className="relative z-10 mx-auto text-center text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 sm:mb-8 lg:mb-12">
            Settings
          </h1>
        </div>
      </section>
      {/* Main Content */}
      <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Password Section */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Password</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-blue-500 hover:underline cursor-pointer">
                  Change Password
                </span>
                <button
                  className="px-4 py-2 bg-blue-500 w-[150px] text-white rounded-md hover:bg-blue-600"
                  onClick={() => setShowChangePassword(true)}
                >
                  Change
                </button>
              </div>
              {/* <div className="flex items-center justify-between">
                <span className="text-blue-500 hover:underline cursor-pointer">
                  Forgot Password
                </span>
                <button
                  className="px-4 py-2 bg-blue-500 w-[150px] text-white rounded-md hover:bg-blue-600"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Reset
                </button>
              </div> */}
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Two-Factor Authentication (2FA)
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-blue-500 hover:underline cursor-pointer">
                    Email verification
                  </p>
                  <p className="text-sm text-gray-500">
                    By using this feature you can get your email verified
                  </p>
                </div>
                {emailVerified ? (
                  <p className="text-blue-500 font-semibold w-[150px] text-center">
                    Verified
                  </p>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-500 w-[150px] text-white rounded-md hover:bg-blue-600"
                    onClick={() => setShowEmailVerification(true)}
                  >
                    Verify
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-500 hover:underline cursor-pointer">
                    Phone number verification
                  </p>
                  <p className="text-sm text-gray-500">
                    By using this feature you can get your phone number verified
                  </p>
                </div>
                {phoneVerified ? (
                  <p className="text-blue-500 font-semibold w-[150px] text-center">
                    Verified
                  </p>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-500 w-[150px] text-white rounded-md hover:bg-blue-600"
                    onClick={() => setShowPhoneVerification(true)}
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Connected Browsers */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Connected Browsers:</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          {session.deviceName?.toLowerCase().includes("pc") ? (
                            <Monitor className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Smartphone className="h-5 w-5 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {session.deviceName || "Unknown Device"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {session.browser || "Unknown Browser"}
                            </p>
                          </div>
                        </div>
                        <button
                          className="px-4 py-2 w-[150px] bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          onClick={() => disconnectSession(session._id)}
                        >
                          Disconnect
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No connected browsers found.</p>
                )}
              </>
            )}
          </div>

          {/* Account Management */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account Managements</h2>
            <div className="space-y-4">
              <button
                className="w-full px-4 py-2 w-[150px] bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => setShowDisableConfirm(true)}
              >
                Disable Account
              </button>
              <button
                className="w-full px-4 py-2 w-[150px] bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* Modals */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  onClick={() => setShowChangePassword(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Change"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEmailVerification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Email Verification</h3>
            <div className="space-y-4">
             
              <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleSendEmailVerificationCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Verification Code"}
              </button>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                onClick={handleVerifyEmailVerificationCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </button>
              {message && <p className="text-green-500 text-sm">{message}</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                className="w-full px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => setShowEmailVerification(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showPhoneVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Phone Verification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <div className="text-sm text-gray-500">{message}</div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  onClick={() => setShowPhoneVerification(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleSendPhoneVerificationCode}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Code"}
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  onClick={handleVerifyPhoneVerificationCode}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable Confirmation Modal */}
      {showDisableConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Disable Profile</h2>
            <p className="text-gray-600 mb-4">
              By disabling your account all the activity on this account will be
              restricted
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                onClick={() => setShowDisableConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleDisableAccount}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Profile</h2>
            <p className="text-gray-600 mb-4">
              By deleting your account you will have a backup of only 6 days
              after that your account will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={handleDeleteAccount}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter 8-digit code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
