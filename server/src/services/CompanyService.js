import CompanyRepository from "../repositories/CompanyRepository.js";
import ApiError from "../utils/ApiError.js";
import { handlePrismaError } from "../utils/prismaError.js";
import { provisionTenant } from "./TenantProvisioningService.js";

class CompanyService {
  async getAll(query, userContext) {
    if (userContext.role !== "SUPER_ADMIN") {
      throw ApiError.forbidden("Only Super Admin can list companies");
    }
    return CompanyRepository.findAll(query);
  }

  async getById(id, userContext) {
    if (userContext.role !== "SUPER_ADMIN" && userContext.companyId !== id) {
      throw ApiError.forbidden("Access denied to this company details");
    }
    const company = await CompanyRepository.findById(id);
    if (!company) throw ApiError.notFound("Company not found");
    return company;
  }

  async create(data, userContext) {
    if (userContext.role !== "SUPER_ADMIN") {
      throw ApiError.forbidden("Only Super Admin can create companies");
    }

    const { mainAdmin, subscriptionPlanId, ...rawCompany } = data;

    try {
      return await provisionTenant({
        company: {
          companyName: rawCompany.companyName,
          email: rawCompany.email,
          address: rawCompany.address,
          website: rawCompany.website || null,
          city: rawCompany.city || null,
          state: rawCompany.state || null,
          country: rawCompany.country || null,
          postalCode: rawCompany.postalCode || null,
          logo: rawCompany.logo || null,
          status: rawCompany.status || "ACTIVE",
        },
        mainAdmin,
        subscriptionPlanId,
        billingCycle: "MONTHLY",
        currency: "INR",
        auditContext: userContext,
        auditAction: "CREATE_COMPANY",
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      handlePrismaError(error);
    }
  }

  async update(id, data, userContext) {
    if (userContext.role !== "SUPER_ADMIN" && userContext.companyId !== id) {
      throw ApiError.forbidden("Access denied to update this company details");
    }
    await this.getById(id, userContext);

    if (
      data
      && Object.prototype.hasOwnProperty.call(data, "companyCode")
      && data.companyCode !== undefined
    ) {
      throw ApiError.badRequest("companyCode is immutable and cannot be changed");
    }

    const payload = { ...data };
    delete payload.mainAdmin;
    delete payload.subscriptionPlanId;
    delete payload.password;
    delete payload.confirmPassword;
    delete payload.companyCode;

    if (userContext.role !== "SUPER_ADMIN") {
      delete payload.email;
      delete payload.status;
    }

    if (payload.email) {
      const existing = await CompanyRepository.findByEmail(payload.email);
      if (existing && existing.id !== id) {
        throw ApiError.conflict("Company email already exists");
      }
    }

    return CompanyRepository.update(id, payload);
  }

  async remove(id, userContext) {
    if (userContext.role !== "SUPER_ADMIN") {
      throw ApiError.forbidden("Only Super Admin can delete companies");
    }
    await this.getById(id, userContext);
    return CompanyRepository.softDelete(id);
  }
}

export default new CompanyService();
