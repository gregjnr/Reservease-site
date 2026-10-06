import { User } from '../models/User.ts';
import { Service } from '../models/Service.ts';
import { Booking } from '../models/Booking.ts';

export const seedDatabase = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    const serviceCount = await Service.countDocuments();

    // 1. Seed default Admin and Demo User if not present
    let admin = await User.findOne({ email: 'admin@reserveease.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@reserveease.com',
        password: 'AdminPassword123!',
        role: 'admin',
        phone: '+1 (555) 019-2834',
      });
      console.log('✅ [Seed] Default Admin created: admin@reserveease.com / AdminPassword123!');
    }

    let demoUser = await User.findOne({ email: 'john.doe@example.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        role: 'user',
        phone: '+1 (555) 432-8765',
      });
      console.log('✅ [Seed] Demo User created: john.doe@example.com / Password123!');
    }

    // 2. Seed Services if empty
    if (serviceCount === 0) {
      const defaultServices = [
        {
          name: 'General Health Consultation',
          description: 'One-on-one comprehensive medical consultation with a certified practitioner addressing general health questions, preventative care, and lab evaluations.',
          duration: 30,
          price: 65,
          category: 'Medical',
          isActive: true,
          availableDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
          workingHours: { start: '09:00', end: '17:00', slotInterval: 30 },
          imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
        },
        {
          name: 'Comprehensive Dental Checkup',
          description: 'Full oral examination including tooth charting, gum disease assessment, non-invasive digital screening, and gentle professional plaque cleaning.',
          duration: 45,
          price: 120,
          category: 'Dental',
          isActive: true,
          availableDays: [1, 2, 3, 4, 5], // Mon-Fri
          workingHours: { start: '09:00', end: '16:30', slotInterval: 45 },
          imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
        },
        {
          name: 'Executive Haircut & Beard Styling',
          description: 'Precision scissor and clipper haircut tailored to your face shape, followed by warm towel shave, beard sculpting, and premium hair conditioning treatment.',
          duration: 45,
          price: 50,
          category: 'Salon',
          isActive: true,
          availableDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
          workingHours: { start: '10:00', end: '18:00', slotInterval: 45 },
          imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
        },
        {
          name: 'Deep Tissue Therapeutic Massage',
          description: 'Targeted therapeutic deep tissue bodywork designed to release chronic muscular tension, alleviate postural pain, and enhance athletic recovery.',
          duration: 60,
          price: 95,
          category: 'Wellness',
          isActive: true,
          availableDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
          workingHours: { start: '09:00', end: '18:00', slotInterval: 60 },
          imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
        },
        {
          name: 'Physical Therapy & Rehabilitation',
          description: 'Personalized evaluation of musculoskeletal injuries, gait analysis, joint mobility drills, and evidence-based strength rehabilitation programs.',
          duration: 60,
          price: 110,
          category: 'Physiotherapy',
          isActive: true,
          availableDays: [1, 2, 3, 4, 5], // Mon-Fri
          workingHours: { start: '08:30', end: '16:30', slotInterval: 60 },
          imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
        },
      ];

      const insertedServices = await Service.insertMany(defaultServices);
      console.log(`✅ [Seed] Successfully seeded ${insertedServices.length} default services`);

      // 3. Seed 2 sample upcoming bookings for the demo user
      const today = new Date();
      // Tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      // Skip to Monday if Sunday
      if (tomorrow.getDay() === 0) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Day after tomorrow
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 1);
      if (dayAfter.getDay() === 0) {
        dayAfter.setDate(dayAfter.getDate() + 1);
      }
      const dayAfterStr = dayAfter.toISOString().split('T')[0];

      await Booking.create([
        {
          user: demoUser._id,
          service: insertedServices[0]._id,
          date: tomorrowStr,
          timeSlot: '10:00',
          customerName: demoUser.name,
          customerEmail: demoUser.email,
          customerPhone: demoUser.phone,
          notes: 'Routine checkup and prescription refill',
          status: 'confirmed',
        },
        {
          user: demoUser._id,
          service: insertedServices[2]._id,
          date: dayAfterStr,
          timeSlot: '14:30',
          customerName: demoUser.name,
          customerEmail: demoUser.email,
          customerPhone: demoUser.phone,
          notes: 'Pre-wedding haircut styling',
          status: 'confirmed',
        },
      ]);
      console.log('✅ [Seed] Seeded 2 sample upcoming bookings');
    }
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error);
  }
};
