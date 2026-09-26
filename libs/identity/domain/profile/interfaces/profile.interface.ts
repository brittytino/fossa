export interface IProfile<TUser = any> {
    uuid: string;
    name: string;
    phone?: string;
    img?: string;
    status: boolean;
    position?: string;
    user?: Partial<TUser>;
    referralSource?: string;
    primaryGoal?: string;
}
