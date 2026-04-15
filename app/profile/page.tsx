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
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { 
  Download,
  BookOpen,
  Trophy,
  GraduationCap,
  Star,
  CheckCircle,
  Bookmark,
  Zap,
  Lock,
  ClipboardList,
} from 'lucide-react';

type Tab = "profile" | "downloads" | "activity" | "bookmarks" | "achievements" | "settings";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "profile", label: "Profile", icon: UserCircleIcon },
  { id: "downloads", label: "Downloads", icon: ArrowDownTrayIcon },
  { id: "activity", label: "Activity", icon: ClockIcon },
  { id: "bookmarks", label: "Saved", icon: BookmarkIcon },
  { id: "achievements", label: "Badges", icon: TrophyIcon },
  { id: "settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<any>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  
  // Additional data for new features
  const [downloads, setDownloads] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [serverActivities, setServerActivities] = useState<any[]>([]);

  const fetchProfile = (isInitial = false) => {
    if (session) {
      setIsLoading(true);
      Promise.all([
        fetch("/api/user/profile").then(res => res.json()),
        fetch("/api/user/downloads").then(res => res.json()),
        fetch("/api/user/bookmarks").then(res => res.json()),
        fetch("/api/user/stats").then(res => res.json()),
        fetch("/api/user/ratings").then(res => res.json()),
      ]).then(([profileData, downloadsData, bookmarksData, statsData, ratingsData]) => {
        setProfile(profileData.user);
        if (profileData.user) {
          setCompletion(calculateProfileCompletion(profileData.user));
          setEmailNotifications(profileData.user.emailNotifications ?? true);
          setPublicProfile(profileData.user.publicProfile ?? false);
        }
        setDownloads(downloadsData.downloads || []);
        setBookmarks(bookmarksData.bookmarks || []);
        setRatings(ratingsData.ratings || []);
        setServerActivities(statsData.activities || []);
        setIsLoading(false);
      }).catch(err => {
        console.error("Error fetching profile data:", err);
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetchProfile(true);
  }, [session]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 animate-pulse">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 w-full">
                <div className="h-6 bg-gray-200 rounded w-48 mb-3 mx-auto sm:mx-0"></div>
                <div className="h-4 bg-gray-100 rounded w-64 mb-3 mx-auto sm:mx-0"></div>
                <div className="h-3 bg-gray-100 rounded w-full max-w-xs mx-auto sm:mx-0"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const missingFields = completion?.breakdown.filter((f: any) => !f.filled && f.key !== 'isVerified' && f.key !== 'profilePicture' && f.key !== 'name') || [];

  const handlePreferenceChange = async (key: 'emailNotifications' | 'publicProfile', value: boolean) => {
    // Update local state immediately for instant UI feedback
    if (key === 'emailNotifications') setEmailNotifications(value);
    if (key === 'publicProfile') setPublicProfile(value);
    
    setSavingPrefs(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) {
        // Revert on error
        if (key === 'emailNotifications') setEmailNotifications(!value);
        if (key === 'publicProfile') setPublicProfile(!value);
      }
    } catch {
      // Revert on error
      if (key === 'emailNotifications') setEmailNotifications(!value);
      if (key === 'publicProfile') setPublicProfile(!value);
    } finally {
      setSavingPrefs(false);
    }
  };

  const totalDownloads = downloads.length;
  const totalBookmarks = bookmarks.length;
  const totalRatings = ratings.length;
  const profileCompletion = completion?.percentage || 0;

  // FEATURE 2: Achievements Data
  const achievements = [
    {
      id: 'first_download',
      title: 'First Download',
      description: 'Downloaded your first resource',
      icon: <Download className="w-7 h-7" />,
      color: 'blue',
      earned: totalDownloads >= 1,
      bg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'downloader_5',
      title: 'Eager Learner',
      description: 'Downloaded 5 resources',
      icon: <BookOpen className="w-7 h-7" />,
      color: 'green',
      earned: totalDownloads >= 5,
      bg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'downloader_20',
      title: 'Study Champion',
      description: 'Downloaded 20 resources',
      icon: <Trophy className="w-7 h-7" />,
      color: 'yellow',
      earned: totalDownloads >= 20,
      bg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      id: 'downloader_50',
      title: 'Commerce Master',
      description: 'Downloaded 50 resources',
      icon: <GraduationCap className="w-7 h-7" />,
      color: 'purple',
      earned: totalDownloads >= 50,
      bg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'first_rating',
      title: 'Reviewer',
      description: 'Rated your first resource',
      icon: <Star className="w-7 h-7" />,
      color: 'yellow',
      earned: totalRatings >= 1,
      bg: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
    },
    {
      id: 'profile_complete',
      title: 'Profile Pro',
      description: 'Completed your profile 100%',
      icon: <CheckCircle className="w-7 h-7" />,
      color: 'green',
      earned: profileCompletion === 100,
      bg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'bookmarker',
      title: 'Bookworm',
      description: 'Saved 5 resources',
      icon: <Bookmark className="w-7 h-7" />,
      color: 'blue',
      earned: totalBookmarks >= 5,
      bg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Joined Commerce.lk',
      icon: <Zap className="w-7 h-7" />,
      color: 'orange',
      earned: true,
      bg: 'bg-orange-100',
      iconColor: 'text-orange-500',
    },
  ];

  // FEATURE 3: Study Progress Data
  const subjectProgress = downloads.reduce((acc, download) => {
    const subject = download.resource?.subject?.name || download.resource?.subject || 'Other'
    acc[subject] = (acc[subject] || 0) + 1
    return acc
  }, {} as Record<string, number>);

  // FEATURE 4: Activity Feed Data
  const activities = [
    // Map downloads to activity items
    ...(downloads || []).map((item: any, index: number) => ({
      id: `download-${item._id || item.resourceId || item.slug || index}-${index}`,
      type: 'download' as const,
      resourceTitle: item.title || item.resource?.title || 'Unknown Resource',
      resourceUrl: item.slug ? `/${item.subject?.slug || ''}/${item.medium || ''}/${item.category?.slug || ''}/${item.slug}` : '#',
      date: item.downloadedAt || item.createdAt || new Date().toISOString(),
      rating: null,
    })),
    // Map ratings to activity items
    ...(ratings || []).map((item: any, index: number) => ({
      id: `rating-${item._id || index}-${index}`,
      type: 'rating' as const,
      resourceTitle: item.resource?.title || 'Unknown Resource',
      resourceUrl: '#',
      date: item.createdAt || new Date().toISOString(),
      rating: item.rating,
    })),
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 20);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <ProfileHeader profile={profile} completion={completion} onEdit={() => setShowEditModal(true)} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          
          {/* Activity Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{downloads?.length || 0}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Downloads</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{bookmarks?.length || 0}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Bookmarks</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-500">{ratings?.length || 0}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Ratings</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{profileCompletion}%</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">Complete</div>
            </div>
          </div>

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
              <div className="flex wrap gap-2">
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
          <div className="flex border-b border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 sm:px-8 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
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
                        <p className="text-gray-900 font-medium">{profile?.name}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                        <p className="text-gray-900 font-medium">{profile?.email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Number</label>
                          <p className={`font-medium ${profile?.phone ? "text-gray-900" : "text-gray-400 italic text-sm"}`}>
                            {profile?.phone || "Not added"}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Gender</label>
                          <p className={`font-medium capitalize ${profile?.gender ? "text-gray-900" : "text-gray-400 italic text-sm"}`}>
                            {profile?.gender || "Not added"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Date of Birth</label>
                          <p className={`font-medium ${profile?.dateOfBirth ? "text-gray-900" : "text-gray-400 italic text-sm"}`}>
                            {profile?.dateOfBirth ? new Date(profile?.dateOfBirth).toLocaleDateString() : "Not added"}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">District</label>
                          <p className="text-gray-900 font-medium">{profile?.district || "Not added"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Educational Details */}
                  <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
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
                          <p className="text-gray-900 font-medium">{profile?.alYear || "Not set"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Medium</label>
                          <p className="text-gray-900 font-medium capitalize">{profile?.medium || "Not set"}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">School</label>
                        <p className="text-gray-900 font-medium">{profile?.school || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Subject Stream</label>
                        <p className={`font-medium ${profile?.stream ? "text-gray-900" : "text-gray-400 italic text-sm"}`}>
                          {profile?.stream || "Not added"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FEATURE 3: Study Progress Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mt-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Study Progress by Subject</h3>
                  <p className="text-sm text-gray-500 mb-5">Resources downloaded per subject</p>
                  
                  {Object.keys(subjectProgress).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No downloads yet. Start exploring resources!</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(subjectProgress)
                        .sort(([,a], [,b]) => b - a)
                        .map(([subject, count]) => {
                          const maxCount = Math.max(...Object.values(subjectProgress));
                          const percentage = Math.round((count / maxCount) * 100);
                          return (
                            <div key={subject}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-gray-700">{subject}</span>
                                <span className="text-sm text-gray-500">{count} resource{count > 1 ? 's' : ''}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === "downloads" && <DownloadsTab />}
            
            {/* FEATURE 4: Recent Activity Feed */}
            {activeTab === "activity" && (
              <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-8">Recent Activity</h3>
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No activity yet</p>
                    <p className="text-gray-400 text-sm mt-1">Your downloads and ratings will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {activities.map((activity) => (
                      <div key={`${activity.id}-${activity.date}`} className="flex gap-4 py-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'download' ? 'bg-blue-100' : 'bg-yellow-100'
                        }`}>
                          {activity.type === 'download' 
                            ? <Download className="w-5 h-5 text-blue-600" />
                            : <Star className="w-5 h-5 text-yellow-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">
                              {activity.type === 'download' ? 'Downloaded' : `Rated ${activity.rating}★`}
                            </span>
                            {' — '}
                            <span className="text-blue-600 truncate">{activity.resourceTitle}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(activity.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short', 
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "bookmarks" && <BookmarksTab />}
            
            {/* FEATURE 2: Achievements tab */}
            {activeTab === "achievements" && (
              <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                  <div className="text-sm font-medium text-gray-500">
                    {achievements.filter(a => a.earned).length} of 8 achievements earned
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {achievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className={`relative bg-white rounded-2xl border-2 p-5 text-center transition-all duration-200 ${
                        achievement.earned
                          ? 'border-gray-100 shadow-sm hover:shadow-md'
                          : 'border-dashed border-gray-200'
                      }`}
                    >
                      {/* Icon circle */}
                      <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                        achievement.earned ? achievement.bg : 'bg-gray-100'
                      }`}>
                        <span className={achievement.earned ? achievement.iconColor : 'text-gray-300'}>
                          {achievement.icon}
                        </span>
                      </div>

                      {/* Title */}
                      <p className={`text-sm font-semibold mb-1 ${
                        achievement.earned ? 'text-gray-900' : 'text-gray-300'
                      }`}>
                        {achievement.title}
                      </p>

                      {/* Description */}
                      <p className={`text-xs leading-relaxed ${
                        achievement.earned ? 'text-gray-500' : 'text-gray-300'
                      }`}>
                        {achievement.description}
                      </p>

                      {/* Lock overlay for unearned */}
                      {!achievement.earned && (
                        <div className="absolute inset-0 flex items-end justify-center pb-3 rounded-2xl">
                          <span className="flex items-center gap-1 text-xs text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-full">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <SettingsTab 
                profile={profile} 
                emailNotifications={emailNotifications}
                publicProfile={publicProfile}
                savingPrefs={savingPrefs}
                onPreferenceChange={handlePreferenceChange}
              />
            )}
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
