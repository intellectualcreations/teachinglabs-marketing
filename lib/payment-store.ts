export interface PaymentRecord {
  id: string;
  studentId: string;
  courseId: string;
  amountCents: number;
  status: 'completed' | 'pending' | 'refunded';
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
): PaymentRecord {
  const id = generateId();
  const record: PaymentRecord = {
    id,
    studentId,
    courseId,
    amountCents,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
  payments.set(id, record);
  return record;
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
