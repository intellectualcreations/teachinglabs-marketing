export interface PaymentRecord {
  id: string;
  studentId: string;
  courseId: string;
  amountCents: number;
  status: 'completed' | 'pending' | 'refunded';
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  createdAt: string;
}

// In-memory store — resets on server restart (fine for demo)
const payments = new Map<string, PaymentRecord>();

let nextId = 1;

function generateId(): string {
  return `pay_${nextId++}`;
}

export function createPayment(
  studentId: string,
  courseId: string,
  amountCents: number,
  stripePaymentIntentId?: string,
  stripeSessionId?: string,
): PaymentRecord {
  const id = generateId();
  const record: PaymentRecord = {
    id,
    studentId,
    courseId,
    amountCents,
    status: 'completed',
    stripePaymentIntentId,
    stripeSessionId,
    createdAt: new Date().toISOString(),
  };
  payments.set(id, record);
  return record;
}

export function createPendingPayment(
  studentId: string,
  courseId: string,
  amountCents: number,
  stripeSessionId: string,
): PaymentRecord {
  const id = generateId();
  const record: PaymentRecord = {
    id,
    studentId,
    courseId,
    amountCents,
    status: 'pending',
    stripeSessionId,
    createdAt: new Date().toISOString(),
  };
  payments.set(id, record);
  return record;
}

export function confirmPaymentBySession(
  stripeSessionId: string,
  stripePaymentIntentId: string,
): PaymentRecord | undefined {
  for (const p of payments.values()) {
    if (p.stripeSessionId === stripeSessionId && p.status === 'pending') {
      p.status = 'completed';
      p.stripePaymentIntentId = stripePaymentIntentId;
      return p;
    }
  }
  return undefined;
}

export function getPayment(
  studentId: string,
  courseId: string,
): PaymentRecord | undefined {
  for (const p of payments.values()) {
    if (
      p.studentId === studentId &&
      p.courseId === courseId &&
      p.status === 'completed'
    ) {
      return p;
    }
  }
  return undefined;
}

export function getPaymentsByStudent(studentId: string): PaymentRecord[] {
  const results: PaymentRecord[] = [];
  for (const p of payments.values()) {
    if (p.studentId === studentId) {
      results.push(p);
    }
  }
  return results;
}

export function getAllPayments(): PaymentRecord[] {
  return Array.from(payments.values());
}

export function getPaymentsByInstructor(instructorCourseIds: string[]): PaymentRecord[] {
  const courseSet = new Set(instructorCourseIds);
  const results: PaymentRecord[] = [];
  for (const p of payments.values()) {
    if (courseSet.has(p.courseId) && p.status === 'completed') {
      results.push(p);
    }
  }
  return results;
}
