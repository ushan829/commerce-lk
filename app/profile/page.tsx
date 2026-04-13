"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import DownloadsTab from "@/components/profile/DownloadsTab";
import BookmarksTab from "@/components/profile/BookmarksTab";
import SettingsTab from "@/components/profile/SettingsTab";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { calculateProfileCompletion } from "@/lib/profileCompletion";
import {
  UserCircleIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

type Tab = "profile" | "downloads" | "bookmarks" | "settings";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "profile", label: "Profile", icon: UserCircleIcon },
  { id: "downloads", label: "Downloads", icon: ArrowDownTrayIcon },
  { id: "bookmarks", label: "Bookmarks", icon: BookmarkIcon },
  { id: "settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<any>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProfile = () => {
    if (session) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile(data.user);
          setCompletion(calculateProfileCompletion(data.user));
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetchProfile();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const missingFields = completion?.breakdown.filter((f: any) => !f.filled && f.key !== 'isVerified' && f.key !== 'profilePicture' && f.key !== 'name') || [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <ProfileHeader profile={profile} completion={completion} onEdit={() => setShowEditModal(true)} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Completion Hints */}
          {completion && completion.percentage < 100 && missingFields.length > 0 && (
            <div className="mb-12 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                  <InformationCircleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Complete your profile</h4>
                  <p className="text-sm text-blue-700/70 font-medium">Add these details to help us personalize your experience.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingFields.slice(0, 3).map((field: any) => (
                  <button
                    key={field.key}
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-white hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-all shadow-sm border border-blue-100"
                  >
                    Add {field.label} (+{field.weight}%)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-100 mb-12 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <UserCircleIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    </div>
                    <button onClick={() => setShowEditModal(true)} className="text-blue-600 text-sm font-bold hover:underline">Edit</button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                      <p className="text-gray-900 font-medium">{profile.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                      <p className="text-gray-900 font-medium">{profile.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Number</label>
                        <p className={`font-medium ${profile.phone ? "text-gray-900" : "text-gray-400 italic text-sm"}`}>
                          {profile.phone || "Not added"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Gender</label>
                        <p className={`font-medium capitalize ${profile.gender ? "text-gray-900" : "text-gray-400 italic text-sm"}`}>
                          {profile.gender || "Not added"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Date of Birth</label>
                        <p className={`font-medium ${profile.dateOfBirth ? "text-gray-900" : "text-gray-400 italic text-sm"}`}>
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not added"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">District</label>
                        <p className="text-gray-900 font-medium">{profile.district || "Not added"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Educational Details */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <AcademicCapIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Educational Details</h3>
                    </div>
                    <button onClick={() => setShowEditModal(true)} className="text-blue-600 text-sm font-bold hover:underline">Edit</button>
                  </div>

                   <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">A/L Year</label>
                        <p className="text-gray-900 font-medium">{profile.alYear || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Medium</label>
                        <p className="text-gray-900 font-medium capitalize">{profile.medium || "Not set"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">School</label>
                      <p className="text-gray-900 font-medium">{profile.school || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Subject Stream</label>
                      <p className={`font-medium ${profile.stream ? "text-gray-900" : "text-gray-400 italic text-sm"}`}>
                        {profile.stream || "Not added"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "downloads" && <DownloadsTab />}
            {activeTab === "bookmarks" && <BookmarksTab />}
            {activeTab === "settings" && <SettingsTab profile={profile} />}
          </div>
        </div>
      </main>
      <Footer />

      {showEditModal && (
        <EditProfileModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={() => {
            fetchProfile();
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}
