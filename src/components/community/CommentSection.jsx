import { MessageCircle } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Reply, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BadgeDisplay from '@/components/badges/BadgeDisplay';

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

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

function CommentItem({ comment, level = 0, onReply, onReact, userBadge }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const totalReactions = comment.reactions 
    ? Object.values(comment.reactions).reduce((sum, users) => sum + users.length, 0)
    : 0;

  return (
    <div className={`${level > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
      <div className="flex gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(comment.author_email)} flex items-center justify-center text-white text-sm font-medium shadow-lg flex-shrink-0 relative`}>
          {getInitials(comment.author_name)}
          {userBadge && userBadge !== 'none' && (
            <div className="absolute -bottom-1 -right-1">
              <BadgeDisplay badge={userBadge} size="xs" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-2xl px-4 py-3">
            <div className="font-semibold text-gray-900 text-sm">
              {comment.author_name}
            </div>
            <p className="text-gray-800 mt-1 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Reactions Display */}
          {totalReactions > 0 && (
            <div className="flex items-center gap-1 mt-2 ml-3">
              {Object.entries(comment.reactions || {}).map(([emoji, users]) => (
                users.length > 0 && (
                  <button
                    key={emoji}
                    onClick={() => onReact(comment.id, emoji)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-gray-200 hover:border-violet-300 text-xs transition-colors"
                  >
                    <span>{emoji}</span>
                    <span className="text-gray-600">{users.length}</span>
                  </button>
                )
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-2 ml-3 text-xs text-gray-500">
            <span>{format(new Date(comment.created_date), 'PPp', { locale: fr })}</span>
            {comment.like_count > 0 && (
              <span className="font-medium">{comment.like_count} likes</span>
            )}
            {level < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                <Reply className="w-3 h-3" />
                Répondre
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="font-medium text-gray-600 hover:text-gray-700 flex items-center gap-1"
              >
                <Smile className="w-3 h-3" />
                Réagir
              </button>
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex gap-1 z-10">
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(comment.id, emoji);
                        setShowReactions(false);
                      }}
                      className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 ml-3"
              >
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="min-h-20 rounded-xl resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={handleReply}
                    className="bg-violet-600 hover:bg-violet-700 rounded-lg"
                  >
                    Répondre
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ comments, onAddComment, onReply, onReact, usersBadges = {} }) {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  // Organize comments by parent
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  const renderComment = (comment, level = 0) => (
    <div key={comment.id}>
      <CommentItem
        comment={comment}
        level={level}
        onReply={onReply}
        onReact={onReact}
        userBadge={usersBadges[comment.author_email]}
      />
      {getReplies(comment.id).map(reply => renderComment(reply, level + 1))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mt-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Commentaires ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <div className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajoutez un commentaire..."
          className="min-h-24 rounded-xl resize-none"
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="mt-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Publier
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-1">
        {topLevelComments.map(comment => renderComment(comment))}
        {comments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Soyez le premier à commenter</p>
          </div>
        )}
      </div>
    </div>
  );
}