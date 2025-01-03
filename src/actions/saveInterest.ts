'use server';
import '@/db';
import { User } from "@/model/user";

export async function saveInterest(name: string, email: string) {
    if (!name.includes('$') && !email.includes('$')) {
        const user = new User({ name, email });
        user.save();
    }
}