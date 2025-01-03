'use server';
import '@/db';
import { User } from "@/model/user";

export async function saveInterest(name: string, email: string): Promise<string | undefined> {
    try {
        if (name.includes('$') || email.includes('$')) { return undefined; }

        const user = new User({ name, email });
        const res = await user.save();
        return res._id.toString();
    } catch {
        return undefined;
    }
}