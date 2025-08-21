import { MESSAGE_TYPE } from '../constants/messages';

export interface ProgressUpdate {
  phase: 'loading' | 'creating' | 'styling' | 'finalizing';
  progress: number;
  message: string;
  canCancel?: boolean;
}

export class ProgressTracker {
  private static instance: ProgressTracker;

  private cancelled = false;

  private currentPhase: ProgressUpdate['phase'] = 'loading';

  private totalSteps = 0;

  private completedSteps = 0;

  private phaseWeights = {
    loading: 0.1,
    creating: 0.5,
    styling: 0.2,
    finalizing: 0.2,
  };

  static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker();
    }
    return ProgressTracker.instance;
  }

  reset(): void {
    this.cancelled = false;
    this.currentPhase = 'loading';
    this.totalSteps = 0;
    this.completedSteps = 0;
  }

  cancel(): void {
    this.cancelled = true;
    this.sendUpdate({
      phase: this.currentPhase,
      progress: this.calculateProgress(),
      message: 'Cancelling operation...',
      canCancel: false,
    });
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  setPhase(phase: ProgressUpdate['phase'], totalSteps?: number): void {
    if (this.cancelled) return;

    this.currentPhase = phase;
    if (totalSteps !== undefined) {
      this.totalSteps = totalSteps;
      this.completedSteps = 0;
    }

    this.sendProgressUpdate();
  }

  incrementProgress(steps: number = 1): void {
    if (this.cancelled) return;

    this.completedSteps = Math.min(this.completedSteps + steps, this.totalSteps);
    this.sendProgressUpdate();
  }

  private calculateProgress(): number {
    const phaseProgress = this.totalSteps > 0 ? this.completedSteps / this.totalSteps : 0;

    const phasesCompleted = {
      loading: 0,
      creating: 0,
      styling: 0,
      finalizing: 0,
    };

    let foundCurrent = false;
    for (const phase of Object.keys(this.phaseWeights) as Array<keyof typeof this.phaseWeights>) {
      if (phase === this.currentPhase) {
        phasesCompleted[phase] = phaseProgress * this.phaseWeights[phase];
        foundCurrent = true;
      } else if (!foundCurrent) {
        phasesCompleted[phase] = this.phaseWeights[phase];
      }
    }

    return Object.values(phasesCompleted).reduce((sum, value) => sum + value, 0);
  }

  private sendProgressUpdate(): void {
    const messages = {
      loading: 'Loading components...',
      creating: `Creating message ${this.completedSteps} of ${this.totalSteps}...`,
      styling: 'Applying styles and themes...',
      finalizing: 'Finalizing layout...',
    };

    this.sendUpdate({
      phase: this.currentPhase,
      progress: this.calculateProgress(),
      message: messages[this.currentPhase],
      canCancel: true,
    });
  }

  private sendUpdate(update: ProgressUpdate): void {
    figma.ui.postMessage({
      type: MESSAGE_TYPE.PROGRESS_UPDATE,
      ...update,
    });
  }

  async withProgress<T>(phase: ProgressUpdate['phase'], totalSteps: number, fn: () => Promise<T>): Promise<T | null> {
    this.setPhase(phase, totalSteps);

    try {
      const result = await fn();
      if (this.cancelled) {
        return null;
      }
      return result;
    } catch (error) {
      if (!this.cancelled) {
        throw error;
      }
      return null;
    }
  }
}
