"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ui/color-picker";
import { Upload, Palette, MessageSquare, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { WaitingRoomConfig } from "./telehealth-video-conferencing";

interface WaitingRoomBrandingProps {
  config: WaitingRoomConfig;
  onSave: (config: WaitingRoomConfig) => void;
  onCancel: () => void;
}

export default function WaitingRoomBranding({ config, onSave, onCancel }: WaitingRoomBrandingProps) {
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = React.useState<WaitingRoomConfig>(config);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to database
      const res = await fetch('/api/telehealth/waiting-room-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localConfig)
      });
      
      if (!res.ok) throw new Error('Failed to save waiting room config');
      
      onSave(localConfig);
      toast({
        title: "Success",
        description: "Waiting room branding updated successfully!",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to save: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBranding = (updates: Partial<WaitingRoomConfig['branding']>) => {
    setLocalConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, ...updates }
    }));
  };

  const updateFeatures = (updates: Partial<WaitingRoomConfig['features']>) => {
    setLocalConfig(prev => ({
      ...prev,
      features: { ...prev.features, ...updates }
    }));
  };

  const addCustomField = () => {
    setLocalConfig(prev => ({
      ...prev,
      customFields: [...prev.customFields, {
        name: '',
        type: 'text',
        required: false,
        options: []
      }]
    }));
  };

  const updateCustomField = (index: number, updates: Partial<WaitingRoomConfig['customFields'][0]>) => {
    setLocalConfig(prev => ({
      ...prev,
      customFields: prev.customFields.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      )
    }));
  };

  const removeCustomField = (index: number) => {
    setLocalConfig(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Waiting Room Branding & Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Branding Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Branding</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                value={localConfig.branding.logoUrl || ''}
                onChange={(e) => updateBranding({ logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="background-image">Background Image URL</Label>
              <Input
                id="background-image"
                value={localConfig.branding.backgroundImage || ''}
                onChange={(e) => updateBranding({ backgroundImage: e.target.value })}
                placeholder="https://example.com/background.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <Input
                id="primary-color"
                type="color"
                value={localConfig.branding.primaryColor}
                onChange={(e) => updateBranding({ primaryColor: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <Input
                id="secondary-color"
                type="color"
                value={localConfig.branding.secondaryColor}
                onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome Message</Label>
            <Textarea
              id="welcome-message"
              value={localConfig.branding.welcomeMessage}
              onChange={(e) => updateBranding({ welcomeMessage: e.target.value })}
              placeholder="Welcome to your telehealth session. Please wait while your provider joins..."
              rows={3}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Features</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-chat">Allow Chat in Waiting Room</Label>
              <Switch
                id="allow-chat"
                checked={localConfig.features.allowChat}
                onCheckedChange={(checked) => updateFeatures({ allowChat: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-screen-share">Allow Screen Sharing</Label>
              <Switch
                id="allow-screen-share"
                checked={localConfig.features.allowScreenShare}
                onCheckedChange={(checked) => updateFeatures({ allowScreenShare: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-recording">Allow Recording</Label>
              <Switch
                id="allow-recording"
                checked={localConfig.features.allowRecording}
                onCheckedChange={(checked) => updateFeatures({ allowRecording: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="require-consent">Require Consent Before Joining</Label>
              <Switch
                id="require-consent"
                checked={localConfig.features.requireConsent}
                onCheckedChange={(checked) => updateFeatures({ requireConsent: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-admit">Auto-Admit Participants</Label>
              <Switch
                id="auto-admit"
                checked={localConfig.features.autoAdmit}
                onCheckedChange={(checked) => updateFeatures({ autoAdmit: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-wait-time">Max Wait Time (minutes)</Label>
              <Input
                id="max-wait-time"
                type="number"
                value={localConfig.features.maxWaitTime}
                onChange={(e) => updateFeatures({ maxWaitTime: parseInt(e.target.value) || 0 })}
                min="0"
                max="120"
              />
            </div>
          </div>
        </div>

        {/* Custom Fields Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Custom Fields</h3>
            <Button variant="outline" onClick={addCustomField}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
          
          {localConfig.customFields.map((field, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Field Name</Label>
                    <Input
                      value={field.name}
                      onChange={(e) => updateCustomField(index, { name: e.target.value })}
                      placeholder="e.g., Emergency Contact"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateCustomField(index, { type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateCustomField(index, { required: checked })}
                    />
                    <Label>Required</Label>
                  </div>
                </div>
                
                {field.type === 'select' && (
                  <div className="space-y-2">
                    <Label>Options (comma separated)</Label>
                    <Input
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => updateCustomField(index, { 
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removeCustomField(index)}
                >
                  Remove Field
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
