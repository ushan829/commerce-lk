"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { CameraIcon, ShareIcon, UserIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface ProfileHeaderProps {
  profile: {
    name: string;
    email: string;
    profilePicture?: string;
    school?: string;
    district?: string;
    isVerified?: boolean;
  };
  completion?: {
    percentage: number;
    message: string;
  };
  onEdit?: () => void;
}

export default function ProfileHeader({ profile, completion, onEdit }: ProfileHeaderProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name} on Commerce.lk`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="bg-gray-50 border-b border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-blue-50 flex items-center justify-center">
              {profile.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile.name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <UserIcon className="w-16 h-16 text-blue-200" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
              <CameraIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              {profile.isVerified && (
                <CheckBadgeIcon className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <p className="text-gray-500 text-lg mb-4">{profile.email}</p>
            
            {completion && (
              <div className="mb-6 max-w-sm mx-auto md:mx-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Completion</span>
                  <span className="text-xs font-bold text-blue-600">{completion.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">{completion.message}</p>
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {profile.school && (
                <span className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium shadow-sm">
                  {profile.school}
                </span>
              )}
              {profile.district && (
                <span className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium shadow-sm">
                  {profile.district}
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-3 shrink-0">
            <button
              onClick={() => onEdit?.()}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              <UserIcon className="w-5 h-5" />
              Edit Profile
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
