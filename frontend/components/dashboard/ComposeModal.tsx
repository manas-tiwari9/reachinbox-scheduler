'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { useScheduledEmails } from '@/hooks/useEmails';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose }) => {
  const { mutate } = useScheduledEmails();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvCount, setCsvCount] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    senderEmail: '',
    startTime: '',
    delayBetweenMs: '10',
    hourlyLimit: '100'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    // Parse CSV to get row count
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvCount(results.data.length);
        if (results.data.length === 0) {
          toast.error('The uploaded CSV file is empty');
        } else {
          toast.success(`${results.data.length} emails detected in CSV`);
        }
      },
      error: () => {
        toast.error('Failed to parse CSV file');
        setCsvFile(null);
        setCsvCount(0);
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please upload a CSV file with recipients');
      return;
    }
    if (csvCount === 0) {
      toast.error('The uploaded CSV file has no recipients');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('subject', formData.subject);
      data.append('body', formData.body);
      data.append('senderEmail', formData.senderEmail);
      
      // Ensure startTime is ISO string
      const startTimeIso = new Date(formData.startTime).toISOString();
      data.append('startTime', startTimeIso);
      
      // Convert seconds to ms
      const delayMs = parseInt(formData.delayBetweenMs) * 1000;
      data.append('delayBetweenMs', delayMs.toString());
      data.append('hourlyLimit', formData.hourlyLimit);
      data.append('csv', csvFile);

      await api.post('/api/emails/schedule', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Emails scheduled successfully!');
      mutate(); // Refresh the list
      
      // Reset and close
      setCsvFile(null);
      setCsvCount(0);
      setFormData({
        subject: '',
        body: '',
        senderEmail: '',
        startTime: '',
        delayBetweenMs: '10',
        hourlyLimit: '100'
      });
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule emails');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Emails">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Sender Email" 
            type="email" 
            name="senderEmail"
            required 
            value={formData.senderEmail}
            onChange={handleChange}
            placeholder="you@company.com"
          />
          <Input 
            label="Start Time" 
            type="datetime-local" 
            name="startTime"
            required 
            value={formData.startTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <Input 
          label="Subject" 
          name="subject"
          required 
          value={formData.subject}
          onChange={handleChange}
          placeholder="Hello {name}"
        />
        
        <Input 
          label="Body (Supports simple templating like {name})" 
          name="body"
          required 
          multiline
          rows={5}
          value={formData.body}
          onChange={handleChange}
          placeholder="Hi {name},&#10;&#10;We would love to..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Delay Between Emails (seconds)" 
            type="number" 
            name="delayBetweenMs"
            required 
            min="1"
            value={formData.delayBetweenMs}
            onChange={handleChange}
          />
          <Input 
            label="Hourly Limit" 
            type="number" 
            name="hourlyLimit"
            required 
            min="1"
            value={formData.hourlyLimit}
            onChange={handleChange}
          />
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipients CSV List
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#2A2A2A] border-dashed rounded-lg cursor-pointer bg-[#111] hover:bg-[#1A1A1A] transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold text-white">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file with at least 'email' column</p>
              </div>
              <input type="file" className="hidden" accept=".csv,.txt" onChange={handleFileChange} />
            </label>
          </div>
          {csvFile && (
            <p className="mt-2 text-sm text-green-400">
              {csvFile.name} ({csvCount} emails detected)
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Schedule Emails
          </Button>
        </div>
      </form>
    </Modal>
  );
};
