import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Building2,
  Mail,
  Lock,
  Calendar,
  Globe,
  Upload,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  GraduationCap,
  Shield,
  Users,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import toast from "react-hot-toast";
import API from "../../utils/api";

const orgTypes = ["Club", "Social Service", "Association"];
const campuses = ["Main Campus", "North Campus", "South Campus", "City Campus", "Online"];
const interestsOptions = [
  "Charity & Volunteering",
  "Clubs & Societies",
  "Associations",
  "Sports & Athletics",
  "Cultural Activities",
  "Technical & Coding",
  "Research & Innovation",
  "Entrepreneurship",
  "Arts & Creativity",
  "Leadership & Development",
  "Community Service",
  "Environmental Causes",
  "Education & Tutoring",
  "Professional Development",
  "Social Events",
];

const roleTypes = {
  Club: ["Debate Club", "Sports Club", "Robotics Club", "Photographic Club", "Cultural Club", "Programming Club", "Music Club", "Drama Club", "Art Club", "Literature Club"],
  "Social Service": ["Blood Bank", "Unnotomomoshir", "Community Service", "Environmental Service", "Educational Support", "Disaster Relief", "Health Awareness", "Poverty Alleviation"],
  Association: ["Sylhet Association", "Dhaka Association", "Khulna Association", "Chittagong Association", "Rajshahi Association", "Barisal Association", "Rangpur Association", "Mymensingh Association"],
};

const departments = [
  { name: "Computer Science and Engineering", code: "cse" },
  { name: "Electrical and Electronic Engineering", code: "eee" },
  { name: "Industrial and Production Engineering", code: "ipe" },
  { name: "Petroleum and Mining Engineering", code: "pme" },
  { name: "Chemical Engineering", code: "che" },
  { name: "Biomedical Engineering", code: "bme" },
  { name: "Textile Engineering", code: "te" },
  { name: "Microbiology", code: "mb" },
  { name: "Fisheries and Marine Bioscience", code: "fmb" },
  { name: "Genetic Engineering and Biotechnology", code: "gebt" },
  { name: "Pharmacy", code: "phar" },
  { name: "Biochemistry and Molecular Biology", code: "bmb" },
  { name: "Environmental Science and Technology", code: "est" },
  { name: "Nutrition and Food Technology", code: "nft" },
  { name: "Food Engineering", code: "fmb" },
  { name: "Climate and Disaster Management", code: "cdm" },
  { name: "Physical Education and Sports Science", code: "pess" },
  { name: "Physiotherapy and Rehabilitation", code: "ptr" },
  { name: "Nursing and Health Science", code: "nhs" },
  { name: "English", code: "eng" },
  { name: "Physics", code: "phy" },
  { name: "Chemistry", code: "chem" },
  { name: "Mathematics", code: "math" },
  { name: "Applied Statistics and Data Science", code: "asd" },
  { name: "Accounting and Information Systems", code: "ais" },
  { name: "Management", code: "mgt" },
  { name: "Finance and Banking", code: "fb" },
  { name: "Marketing", code: "mkt" },
];

const sessions = Array.from({ length: 10 }, (_, index) => {
  const year = new Date().getFullYear() - index;
  return `${year}-${year + 1}`;
});

export default function SignUp() {
  const navigate = useNavigate();
  const { createUser, updateProfileUser, obtainAccessToken, setLoading: setAuthLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    orgType: "",
    roleType: "",
    tagline: "",
    founded: "",
    website: "",
    phone: "",
    campus: "",
    mission: "",
    studentId: "",
    department: "",
    session: "",
    interests: "",
  });

  const fileInputRef = useRef(null);

  const detectedRole = useMemo(() => {
    const normalized = String(formData.email || "").trim().toLowerCase();
    if (!normalized) return "student";
    return /@student\.just\.edu\.bd$/.test(normalized) ? "student" : "organization";
  }, [formData.email]);

  useEffect(() => {
    setRole(detectedRole);
  }, [detectedRole]);

  const handlePhotoUpload = async (file) => {
    const url = await uploadToCloudinary(file);
    if (!url) {
      throw new Error("Failed to upload image");
    }
    return url;
  };

  const validatePassword = (password) => {
    const strength = {
      length: password.length >= 8,
      uppercase: /(?=.*[A-Z])/.test(password),
      lowercase: /(?=.*[a-z])/.test(password),
      number: /(?=.*\d)/.test(password),
      special: /(?=.*[@$!%*?&])/.test(password),
    };

    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const getPasswordStrength = () => {
    const values = Object.values(passwordStrength);
    return (values.filter(Boolean).length / values.length) * 100;
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 40) return "from-red-500 to-red-600";
    if (strength <= 80) return "from-amber-500 to-orange-500";
    return "from-emerald-500 to-cyan-500";
  };

  const getStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength <= 40) return "Weak";
    if (strength <= 80) return "Medium";
    return "Strong";
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className="flex items-center gap-2 text-xs">
      {met ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-slate-300" />}
      <span className={met ? "text-emerald-700" : "text-slate-500"}>{text}</span>
    </div>
  );

  const handleNext = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError("Complete the basic account fields first.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Use a stronger password before continuing.");
      return;
    }

    setError("");
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    let createdFirebaseUser = null;
    let creatingToast = null;

    try {
      creatingToast = toast.loading("Creating your account...");

      let photoURL = "";
      if (photoFile) {
        const uploadToast = toast.loading("Uploading profile photo...");
        photoURL = await handlePhotoUpload(photoFile);
        toast.success("Photo uploaded successfully!", { id: uploadToast });
      }

      const userCredential = await createUser(formData.email, formData.password);
      createdFirebaseUser = userCredential.user;

      const userData = {
        uid: createdFirebaseUser.uid,
        email: formData.email,
        name: formData.name,
        role,
        photoURL:
          photoURL ||
          (role === "organization"
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.orgName || formData.name)}&background=4bbeff&color=fff`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=4bbeff&color=fff`),
        createdAt: new Date().toISOString(),
        ...(role === "organization"
          ? {
              organization: {
                name: formData.orgName,
                type: formData.orgType,
                roleType: formData.roleType,
                tagline: formData.tagline,
                founded: formData.founded,
                website: formData.website,
                phone: formData.phone,
                campus: formData.campus,
                mission: formData.mission,
                membershipCount: 0,
                status: "active",
                verified: false,
              },
            }
          : {
              student: {
                studentId: formData.studentId,
                department: formData.department,
                session: formData.session,
                interests: formData.interests,
                year: new Date().getFullYear(),
                status: "active",
                verified: false,
              },
            }),
      };

      await API.post("/users", userData);
      await obtainAccessToken(createdFirebaseUser);
      await updateProfileUser({
        displayName: role === "organization" ? formData.orgName || formData.name : formData.name,
        photoURL: userData.photoURL,
      });

      toast.success("Account created successfully!", { id: creatingToast });
      navigate("/dashboard");
    } catch (submitError) {
      console.error("Signup error:", submitError);

      if (createdFirebaseUser) {
        try {
          await createdFirebaseUser.delete();
        } catch (deleteError) {
          console.error("Failed to rollback Firebase user:", deleteError);
        }
      }

      const message = submitError?.response?.data?.message || submitError?.message || "Failed to create account. Please try again.";
      setError(message);
      toast.error(message, { id: creatingToast || undefined });
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-4 py-6 pt-20">
      <motion.div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, repeatType: "mirror", duration: 7, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, repeatType: "mirror", duration: 7, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ repeat: Infinity, repeatType: "mirror", duration: 8, ease: "easeInOut" }}
      />

      <div className="relative mx-auto w-full max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white/90 shadow-[0_24px_80px_rgba(14,116,144,0.16)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-5 py-5 md:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Unified Signup
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Create your Aidevo account without extra branching
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Full-width, two-step signup that keeps the page compact and lets the form breathe across the entire canvas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                Step {step} of 2
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                {role === "student" ? "Student profile" : "Organization profile"}
              </div>
            </div>
          </div>

          <div className="px-5 py-5 md:px-7">
            <div className="grid gap-4 rounded-3xl bg-slate-50 p-2 sm:grid-cols-2 lg:grid-cols-4">
              <WizardChip active={step === 1} icon={User} title="Basics" text="Name, email, password" />
              <WizardChip active={step === 2} icon={role === "student" ? GraduationCap : Building2} title="Profile" text={role === "student" ? "Student details" : "Organization details"} />
              <WizardChip active={Boolean(photoFile)} icon={Camera} title="Photo" text={photoFile ? "Selected" : "Optional"} />
              <WizardChip active={true} icon={Check} title="Ready" text="Go live after submit" />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-xs text-sky-700">
              Detected account type: <span className="font-semibold">{role === "student" ? "Student" : "Organization"}</span>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-br from-sky-100 to-cyan-100 shadow-xl">
                            {photoPreview ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" /> : <Camera className="h-9 w-9 text-slate-400" />}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                            className="absolute -bottom-2 -right-2 rounded-full bg-sky-600 p-2.5 text-white shadow-lg transition hover:bg-sky-700"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={loading} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">Profile photo</p>
                          <p className="text-xs text-slate-500">Optional, but recommended.</p>
                          <p className="mt-2 text-xs text-slate-500">Square crop works best.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Full name" icon={User} value={formData.name} onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))} placeholder="Your full name" disabled={loading} required />
                      <Field label="Email address" icon={Mail} value={formData.email} onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))} placeholder="you@example.com" disabled={loading} required helperText="Student email is auto-detected by domain." />
                      <Field label="Password" icon={Lock} value={formData.password} onChange={(value) => { setFormData((prev) => ({ ...prev, password: value })); validatePassword(value); }} placeholder="Create a strong password" disabled={loading} required type={showPassword ? "text" : "password"} action={<IconToggle onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</IconToggle>} />
                      <Field
                        label="Confirm password"
                        icon={Lock}
                        value={formData.confirmPassword}
                        onChange={(value) => setFormData((prev) => ({ ...prev, confirmPassword: value }))}
                        placeholder="Repeat your password"
                        disabled={loading}
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        action={
                          <IconToggle onClick={() => setShowConfirmPassword((prev) => !prev)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </IconToggle>
                        }
                        helperText={formData.confirmPassword ? (formData.password === formData.confirmPassword ? "Passwords match" : "Passwords do not match") : ""}
                        helperTone={formData.confirmPassword ? (formData.password === formData.confirmPassword ? "success" : "error") : "muted"}
                      />
                    </div>
                  </div>

                  {formData.password && (
                    <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-slate-50 to-sky-50 p-4">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Password strength</span>
                        <span>{getStrengthText()}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${getStrengthColor()}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${getPasswordStrength()}%` }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        <PasswordRequirement met={passwordStrength.length} text="At least 8 characters" />
                        <PasswordRequirement met={passwordStrength.uppercase} text="One uppercase letter" />
                        <PasswordRequirement met={passwordStrength.lowercase} text="One lowercase letter" />
                        <PasswordRequirement met={passwordStrength.number} text="One number" />
                        <PasswordRequirement met={passwordStrength.special} text="One special character" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button type="button" onClick={handleNext} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
                    <p className="text-sm font-semibold text-slate-900">{role === "student" ? "Student profile" : "Organization profile"}</p>
                    <p className="mt-1 text-xs text-slate-600">Only the relevant fields are shown here, keeping the page wide and compact.</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {role === "organization" ? (
                      <motion.div key="organization" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="grid gap-4 xl:grid-cols-2">
                          <Field label="Organization name" icon={Building2} value={formData.orgName} onChange={(value) => setFormData((prev) => ({ ...prev, orgName: value }))} placeholder="Photographic Society" disabled={loading} required />
                          <SelectField label="Organization type" icon={Users} value={formData.orgType} onChange={(value) => setFormData((prev) => ({ ...prev, orgType: value, roleType: "" }))} options={orgTypes} placeholder="Select type" disabled={loading} required />
                        </div>
                        <SelectField label="Organization sub-type" icon={Sparkles} value={formData.roleType} onChange={(value) => setFormData((prev) => ({ ...prev, roleType: value }))} options={formData.orgType ? roleTypes[formData.orgType] || [] : []} placeholder={formData.orgType ? `Select ${formData.orgType} subtype` : "Select organization type first"} disabled={loading || !formData.orgType} required helperText="Pick the subtype that best fits your group." />
                        <div className="grid gap-4 xl:grid-cols-3">
                          <Field label="Tagline" icon={Target} value={formData.tagline} onChange={(value) => setFormData((prev) => ({ ...prev, tagline: value }))} placeholder="Short mission line" disabled={loading} />
                          <Field label="Founded" icon={Calendar} value={formData.founded} onChange={(value) => setFormData((prev) => ({ ...prev, founded: value }))} type="date" disabled={loading} />
                          <SelectField label="Campus" icon={Target} value={formData.campus} onChange={(value) => setFormData((prev) => ({ ...prev, campus: value }))} options={campuses} placeholder="Select campus" disabled={loading} />
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                          <Field label="Phone" icon={Mail} value={formData.phone} onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))} placeholder="+880..." disabled={loading} />
                          <Field label="Website" icon={Globe} value={formData.website} onChange={(value) => setFormData((prev) => ({ ...prev, website: value }))} placeholder="https://your-org.edu" disabled={loading} />
                        </div>
                        <textarea
                          value={formData.mission}
                          onChange={(e) => setFormData((prev) => ({ ...prev, mission: e.target.value }))}
                          placeholder="Mission statement"
                          className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                          disabled={loading}
                        />
                      </motion.div>
                    ) : (
                      <motion.div key="student" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="grid gap-4 xl:grid-cols-3">
                          <Field label="Student ID" icon={User} value={formData.studentId} onChange={(value) => setFormData((prev) => ({ ...prev, studentId: value }))} placeholder="200142" disabled={loading} required />
                          <SelectField label="Session" icon={Calendar} value={formData.session} onChange={(value) => setFormData((prev) => ({ ...prev, session: value }))} options={sessions} placeholder="Select session" disabled={loading} required />
                          <SelectField label="Department" icon={Building2} value={formData.department} onChange={(value) => setFormData((prev) => ({ ...prev, department: value }))} options={departments.map((dept) => `${dept.name} (${dept.code})`)} placeholder="Select department" disabled={loading} required />
                        </div>
                        <SelectField label="Interests" icon={Heart} value={formData.interests} onChange={(value) => setFormData((prev) => ({ ...prev, interests: value }))} options={interestsOptions} placeholder="Select your interests" disabled={loading} helperText="Used to personalize recommendations." />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button type="button" onClick={handleBack} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:from-sky-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6">
                      {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Creating Account...</> : <><Check className="h-4 w-4" /> Create Account</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <button onClick={() => navigate("/signin")} disabled={loading} className="font-semibold text-sky-700 transition hover:text-sky-800">
                Sign In
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, placeholder, disabled, required, type = "text", helperText = "", helperTone = "muted", action = null }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
        <Icon className="h-4 w-4 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {action}
      </div>
      {helperText ? (
        <p className={`text-[11px] ${helperTone === "success" ? "text-emerald-600" : helperTone === "error" ? "text-rose-600" : "text-slate-500"}`}>
          {helperText}
        </p>
      ) : null}
    </label>
  );
}

function SelectField({ label, icon: Icon, value, onChange, options, placeholder, disabled, required, helperText = "" }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
        <Icon className="h-4 w-4 text-slate-400" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={required}
          className="w-full bg-transparent text-sm outline-none"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {helperText ? <p className="text-[11px] text-slate-500">{helperText}</p> : null}
    </label>
  );
}

function IconToggle({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
      {children}
    </button>
  );
}

function WizardChip({ active, icon: Icon, title, text }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${active ? "border-sky-200 bg-white shadow-sm" : "border-transparent bg-transparent"}`}>
      <div className="flex items-center gap-2">
        <div className={`rounded-full p-2 ${active ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-500"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
