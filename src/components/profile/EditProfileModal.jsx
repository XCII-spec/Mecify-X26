const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, X, Palette } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PROFILE_THEMES = {
  violet: { from: 'from-violet-600', to: 'to-purple-600', name: 'Violet' },
  blue: { from: 'from-blue-600', to: 'to-cyan-600', name: 'Bleu' },
  green: { from: 'from-emerald-600', to: 'to-teal-600', name: 'Vert' },
  orange: { from: 'from-orange-600', to: 'to-amber-600', name: 'Orange' },
  pink: { from: 'from-pink-600', to: 'to-rose-600', name: 'Rose' },
  red: { from: 'from-red-600', to: 'to-pink-600', name: 'Rouge' },
};

const SOCIAL_ICONS = {
  twitter: '𝕏',
  linkedin: 'in',
  github: '',
  instagram: '',
  facebook: '',
  youtube: '',
};

export default function EditProfileModal({ open, onClose, user }) {
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    website: user?.website || '',
    interests: user?.interests?.join(', ') || '',
    status: user?.status || '',
    status_emoji: user?.status_emoji || '',
    profile_theme: user?.profile_theme || 'violet',
    social_links: {
      twitter: user?.social_links?.twitter || '',
      linkedin: user?.social_links?.linkedin || '',
      github: user?.social_links?.github || '',
      instagram: user?.social_links?.instagram || '',
      facebook: user?.social_links?.facebook || '',
      youtube: user?.social_links?.youtube || '',
    },
  });
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await db.auth.updateMe({
        ...data,
        interests: data.interests ? data.interests.split(',').map(i => i.trim()).filter(Boolean) : [],
        social_links: data.social_links,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profil mis à jour');
      onClose();
    },
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      await db.auth.updateMe({ avatar_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Avatar mis à jour');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
    setUploading(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      await db.auth.updateMe({ cover_url: file_url });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Couverture mise à jour');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div>
            <Label>Statut personnalisé</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={formData.status_emoji}
                onChange={(e) => setFormData({ ...formData, status_emoji: e.target.value })}
                placeholder="😊"
                className="w-20"
                maxLength={2}
              />
              <Input
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                placeholder="Votre statut..."
                className="flex-1"
              />
            </div>
          </div>

          {/* Theme */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4" />
              Thème du profil
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PROFILE_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({ ...formData, profile_theme: key })}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    formData.profile_theme === key
                      ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`h-8 rounded-lg bg-gradient-to-r ${theme.from} ${theme.to}`} />
                  <div className="text-sm font-medium text-gray-700 mt-2">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Avatar */}
          <div>
            <Label>Avatar</Label>
            <div className="flex items-center gap-4 mt-2">
              {user?.avatar_url ? (
                <div className="relative">
                  <img src={user.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                  <button
                    onClick={() => {
                      db.auth.updateMe({ avatar_url: null });
                      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Changer l'avatar</span>
                </div>
              </label>
            </div>
          </div>

          {/* Cover */}
          <div>
            <Label>Couverture</Label>
            {user?.cover_url ? (
              <div className="relative mt-2">
                <img src={user.cover_url} alt="Cover" className="w-full h-32 rounded-xl object-cover" />
                <button
                  onClick={() => {
                    db.auth.updateMe({ cover_url: null });
                    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 mt-2" />
            )}
            <label className="cursor-pointer mt-2 inline-block">
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Changer la couverture</span>
              </div>
            </label>
          </div>

          {/* Bio */}
          <div>
            <Label>Biographie</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Parlez de vous..."
              className="mt-2 h-24"
            />
          </div>

          {/* Phone */}
          <div>
            <Label>Téléphone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
              className="mt-2"
            />
          </div>

          {/* Location */}
          <div>
            <Label>Localisation</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Paris, France"
              className="mt-2"
            />
          </div>

          {/* Website */}
          <div>
            <Label>Site web</Label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://monsite.com"
              className="mt-2"
            />
          </div>

          {/* Interests */}
          <div>
            <Label>Centres d'intérêt (séparés par des virgules)</Label>
            <Input
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder="Technologie, Voyage, Musique"
              className="mt-2"
            />
          </div>

          {/* Social Links */}
          <div>
            <Label className="mb-3 block">Réseaux sociaux</Label>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600 mb-1">Twitter / X</div>
                <Input
                  value={formData.social_links.twitter}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_links: { ...formData.social_links, twitter: e.target.value }
                  })}
                  placeholder="@username"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">LinkedIn</div>
                <Input
                  value={formData.social_links.linkedin}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_links: { ...formData.social_links, linkedin: e.target.value }
                  })}
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">GitHub</div>
                <Input
                  value={formData.social_links.github}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_links: { ...formData.social_links, github: e.target.value }
                  })}
                  placeholder="github.com/username"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Instagram</div>
                <Input
                  value={formData.social_links.instagram}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_links: { ...formData.social_links, instagram: e.target.value }
                  })}
                  placeholder="@username"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Facebook</div>
                <Input
                  value={formData.social_links.facebook}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_links: { ...formData.social_links, facebook: e.target.value }
                  })}
                  placeholder="facebook.com/username"
                />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">YouTube</div>
                <Input
                  value={formData.social_links.youtube}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    social_links: { ...formData.social_links, youtube: e.target.value }
                  })}
                  placeholder="youtube.com/@username"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => updateProfileMutation.mutate(formData)}
              disabled={updateProfileMutation.isPending || uploading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Enregistrer'
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}