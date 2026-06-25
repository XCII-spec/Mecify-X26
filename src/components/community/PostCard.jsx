import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Eye, Pin, Megaphone, ExternalLink, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BadgeDisplay from '@/components/badges/BadgeDisplay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(email) {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
  ];
  const index = email ? email.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

export default function PostCard({ post, userBadge, onLike, onComment, isLiked, canManage }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const contentLimit = 300;
  const shouldTruncate = post.content?.length > contentLimit;

  const displayContent = shouldTruncate && !showFullContent
    ? post.content.slice(0, contentLimit) + '...'
    : post.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Header with pin/announcement indicators */}
      {(post.is_pinned || post.is_announcement) && (
        <div className={`px-6 py-2 flex items-center gap-2 text-sm font-medium ${
          post.is_announcement 
            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' 
            : 'bg-violet-50 text-violet-700'
        }`}>
          {post.is_announcement ? (
            <>
              <Megaphone className="w-4 h-4" />
              Annonce officielle
            </>
          ) : (
            <>
              <Pin className="w-4 h-4" />
              Post épinglé
            </>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(post.author_email)} flex items-center justify-center text-white font-medium shadow-lg relative`}>
              {getInitials(post.author_name)}
              {userBadge && userBadge !== 'none' && (
                <div className="absolute -bottom-1 -right-1">
                  <BadgeDisplay badge={userBadge} size="sm" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{post.author_name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(post.created_date), 'PPp', { locale: fr })}
              </span>
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pin className="w-4 h-4 mr-2" />
                  {post.is_pinned ? 'Désépingler' : 'Épingler'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Megaphone className="w-4 h-4 mr-2" />
                  Marquer comme annonce
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {displayContent}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-violet-600 hover:text-violet-700 font-medium text-sm mt-2"
            >
              {showFullContent ? 'Voir moins' : 'Voir plus'}
            </button>
          )}
        </div>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className={`grid gap-2 mb-4 ${
            post.media_urls.length === 1 ? 'grid-cols-1' : 
            post.media_urls.length === 2 ? 'grid-cols-2' : 
            'grid-cols-2 sm:grid-cols-3'
          }`}>
            {post.media_urls.map((url, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
                {post.media_types?.[index] === 'video' ? (
                  <video
                    src={url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Link Preview */}
        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-4 border border-gray-200 rounded-xl overflow-hidden hover:border-violet-300 transition-colors"
          >
            {post.link_image && (
              <img
                src={post.link_image}
                alt={post.link_title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4 bg-gray-50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {post.link_title || post.link_url}
                  </div>
                  {post.link_description && (
                    <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {post.link_description}
                    </div>
                  )}
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </a>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{post.view_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            <span>{post.like_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comment_count || 0}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`flex-1 rounded-xl ${
              isLiked 
                ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-pink-600' : ''}`} />
            J'aime
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="flex-1 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Commenter
          </Button>
        </div>
      </div>
    </motion.div>
  );
}