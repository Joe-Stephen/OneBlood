import { AdminRepository } from './admin.repository';

export class AdminService {
  constructor(private readonly adminRepo: AdminRepository) {}

  getDashboard() {
    return this.adminRepo.getDashboardStats();
  }

  listUsers(params: { role?: string; isActive?: boolean; search?: string; page: number; limit: number }) {
    const offset = (params.page - 1) * params.limit;
    return this.adminRepo.listUsers({ ...params, offset });
  }

  updateUser(id: string, data: Partial<{ isActive: boolean; role: string }>) {
    return this.adminRepo.updateUser(id, data);
  }

  listHospitals(params: { verificationStatus?: string; city?: string; page: number; limit: number }) {
    const offset = (params.page - 1) * params.limit;
    return this.adminRepo.listHospitals({ ...params, offset });
  }

  createHospital(data: Record<string, unknown>) {
    return this.adminRepo.createHospital(data);
  }

  verifyHospital(id: string, status: string, adminId: string) {
    return this.adminRepo.verifyHospital(id, status, adminId);
  }

  getAuditLogs(params: { actorId?: string; action?: string; page: number; limit: number }) {
    const offset = (params.page - 1) * params.limit;
    return this.adminRepo.getAuditLogs({ ...params, offset });
  }
}
