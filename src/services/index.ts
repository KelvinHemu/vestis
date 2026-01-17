/* ============================================
   Services - Barrel Export
   Centralized exports for all API services
   ============================================ */

// Authentication Services
export { default as authService } from './authService';
export { default as userService } from './userService';

// Generation Services
export { flatLayService } from './flatLayService';
export { generationService } from './generationService';
export { mannequinService } from './mannequinService';
export { backgroundChangeService } from './backgroundChangeService';
export * from './backgroundService';
export { chatService } from './chatService';

// On-Model Services
export { onModelPhotosService } from './onModelPhotosService';

// Model Services
export { default as modelService } from './modelService';
export { default as modelRegistrationService } from './modelRegistrationService';
export { default as customModelService } from './customModelService';

// Payment Services
export { default as paymentService } from './paymentService';





