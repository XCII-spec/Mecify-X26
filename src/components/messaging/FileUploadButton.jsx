
import React, { useRef, useState } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';

export default function FileUploadButton({ onFileSent }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10 Mo)');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });

      const type = file.type.startsWith('image/') ? 'image'
