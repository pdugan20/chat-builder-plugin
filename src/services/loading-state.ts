type LoadingStage = 'authenticating' | 'generating' | 'parsing' | 'building' | 'complete';

interface StageInfo {
  description: string;
  progress: number;
}

export default class LoadingStateManager {
  private currentStage: LoadingStage = 'authenticating';

  private readonly stageInfo: Record<LoadingStage, StageInfo> = {
    authenticating: {
      description: 'Authenticating with Claude...',
      progress: 10,
    },
    generating: {
      description: 'Generating chat conversation...',
      progress: 30,
    },
    parsing: {
      description: 'Parsing response...',
      progress: 60,
    },
    building: {
      description: 'Building UI components...',
      progress: 80,
    },
    complete: {
      description: 'Complete!',
      progress: 100,
    },
  };

  getCurrentStage(): LoadingStage {
    return this.currentStage;
  }

  getStageDescription(): string {
    return this.stageInfo[this.currentStage].description;
  }

  getProgress(): number {
    return this.stageInfo[this.currentStage].progress;
  }

  onStreamStart(): void {
    this.currentStage = 'generating';
  }

  onStreamComplete(): void {
    this.currentStage = 'parsing';
  }

  onBuildStart(): void {
    this.currentStage = 'building';
  }

  onBuildComplete(): void {
    this.currentStage = 'complete';
  }

  reset(): void {
    this.currentStage = 'authenticating';
  }
}
