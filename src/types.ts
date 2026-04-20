export interface ScanResult {
  url: string;
  images: ImageResult[];
  videos: VideoResult[];
}

export interface ImageResult {
  src: string;
  alt: string;
  analysis?: PrivacyAnalysis;
  status: 'pending' | 'analyzing' | 'done' | 'error';
}

export interface VideoResult {
  src: string;
  analysis?: PrivacyAnalysis;
  status: 'pending' | 'analyzing' | 'done' | 'error';
}

export interface PrivacyAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  detectedMarkers: string[];
  recommendations: string[];
  summary: string;
}
