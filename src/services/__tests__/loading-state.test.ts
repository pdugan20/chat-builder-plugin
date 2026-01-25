import { LoadingStateManager } from '../loading-state';

describe('LoadingStateManager', () => {
  let loadingManager: LoadingStateManager;

  beforeEach(() => {
    loadingManager = new LoadingStateManager();
  });

  describe('initial state', () => {
    it('should start in authenticating stage', () => {
      expect(loadingManager.getCurrentStage()).toBe('authenticating');
    });

    it('should have correct initial description', () => {
      expect(loadingManager.getStageDescription()).toBe('Authenticating with Claude...');
    });

    it('should have correct initial progress', () => {
      expect(loadingManager.getProgress()).toBe(10);
    });
  });

  describe('onStreamStart', () => {
    it('should transition to generating stage', () => {
      loadingManager.onStreamStart();
      expect(loadingManager.getCurrentStage()).toBe('generating');
    });

    it('should update description to generating', () => {
      loadingManager.onStreamStart();
      expect(loadingManager.getStageDescription()).toBe('Generating chat conversation...');
    });

    it('should update progress to 30', () => {
      loadingManager.onStreamStart();
      expect(loadingManager.getProgress()).toBe(30);
    });
  });

  describe('onStreamComplete', () => {
    it('should transition to parsing stage', () => {
      loadingManager.onStreamComplete();
      expect(loadingManager.getCurrentStage()).toBe('parsing');
    });

    it('should update description to parsing', () => {
      loadingManager.onStreamComplete();
      expect(loadingManager.getStageDescription()).toBe('Parsing response...');
    });

    it('should update progress to 60', () => {
      loadingManager.onStreamComplete();
      expect(loadingManager.getProgress()).toBe(60);
    });
  });

  describe('onBuildStart', () => {
    it('should transition to building stage', () => {
      loadingManager.onBuildStart();
      expect(loadingManager.getCurrentStage()).toBe('building');
    });

    it('should update description to building', () => {
      loadingManager.onBuildStart();
      expect(loadingManager.getStageDescription()).toBe('Building UI components...');
    });

    it('should update progress to 80', () => {
      loadingManager.onBuildStart();
      expect(loadingManager.getProgress()).toBe(80);
    });
  });

  describe('onBuildComplete', () => {
    it('should transition to complete stage', () => {
      loadingManager.onBuildComplete();
      expect(loadingManager.getCurrentStage()).toBe('complete');
    });

    it('should update description to complete', () => {
      loadingManager.onBuildComplete();
      expect(loadingManager.getStageDescription()).toBe('Complete!');
    });

    it('should update progress to 100', () => {
      loadingManager.onBuildComplete();
      expect(loadingManager.getProgress()).toBe(100);
    });
  });

  describe('reset', () => {
    it('should return to authenticating stage', () => {
      loadingManager.onStreamStart();
      loadingManager.onStreamComplete();
      loadingManager.reset();
      expect(loadingManager.getCurrentStage()).toBe('authenticating');
    });

    it('should reset description and progress', () => {
      loadingManager.onBuildComplete();
      loadingManager.reset();
      expect(loadingManager.getStageDescription()).toBe('Authenticating with Claude...');
      expect(loadingManager.getProgress()).toBe(10);
    });
  });

  describe('full workflow progression', () => {
    it('should progress through all stages correctly', () => {
      // Start
      expect(loadingManager.getCurrentStage()).toBe('authenticating');
      expect(loadingManager.getProgress()).toBe(10);

      // Stream starts
      loadingManager.onStreamStart();
      expect(loadingManager.getCurrentStage()).toBe('generating');
      expect(loadingManager.getProgress()).toBe(30);

      // Stream completes
      loadingManager.onStreamComplete();
      expect(loadingManager.getCurrentStage()).toBe('parsing');
      expect(loadingManager.getProgress()).toBe(60);

      // Build starts
      loadingManager.onBuildStart();
      expect(loadingManager.getCurrentStage()).toBe('building');
      expect(loadingManager.getProgress()).toBe(80);

      // Build completes
      loadingManager.onBuildComplete();
      expect(loadingManager.getCurrentStage()).toBe('complete');
      expect(loadingManager.getProgress()).toBe(100);
    });
  });
});
