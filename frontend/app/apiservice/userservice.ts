import api from "./apiservice";

export interface UserCreateDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
    companyId: number;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface UserIdDto {
    id: number;
}

export interface UserUpdateDto {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

export interface UserResponseDto {
    id: number;
    name: string;
    email: string;
    phone?: string;
    password:string;
    role: string;
    status: boolean;
    companyId?: number;
    companyName?: string;
    createdAt?: string;
}

export interface SendPasswordOtpDto {
    email: string;
}

export interface VerifyPasswordOtpDto {
    email: string;
    otp: string;
}

export interface ResetPasswordDto {
    email: string;
    newPassword: string;
    confirmPassword: string;
}

export interface CompanyIdDto {
    id: number;
}

export interface AuthResponseDto {
    message: string;
    token: string;
    user: UserResponseDto;
}

const userService = {

    register: async (data: UserCreateDto): Promise<AuthResponseDto> => {
        return await api.post("/api/user/register", data);
    },

    login: async (data: LoginUserDto): Promise<AuthResponseDto> => {
        return await api.post("/api/user/login", data);
    },

    getAllUsers: async (): Promise<UserResponseDto[]> => {
        return await api.post("/api/user/all", {});
    },

    getUserById: async (data: UserIdDto): Promise<UserResponseDto> => {
        return await api.post("/api/user/get-by-id", data);
    },

        sendPasswordOtp: async (data: SendPasswordOtpDto): Promise<string> => {
        return await api.post("/api/user/send-password-otp", data);
    },

    verifyPasswordOtp: async (data: VerifyPasswordOtpDto): Promise<string> => {
        return await api.post("/api/user/verify-password-otp", data);
    },

    resetPassword: async (data: ResetPasswordDto): Promise<string> => {
        return await api.post("/api/user/reset-password", data);
    },

    updateUser: async (data: UserUpdateDto): Promise<UserResponseDto> => {
        return await api.post("/api/user/update", data);
    },

    deleteUser: async (data: UserIdDto): Promise<string> => {
        return await api.post("/api/user/delete", data);
    },

    getUsersByCompany: async (
        data: CompanyIdDto
    ): Promise<UserResponseDto[]> => {
        return await api.post("/api/user/get-by-company", data);
    },

};

export default userService;