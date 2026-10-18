import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  DollarSign,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { SchoolService } from '../supabase/supabaseClient';
import { Fee } from '../types';
import { StatusBadge } from '../components/common/Badges';
import { Modal } from '../components/common/Modal';

export const FeesPage: React.FC = () => {
  const { currentUser, dataVersion, refreshData } = useApp();
  const { showToast } = useToast();

  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'bank_transfer' | 'card' | 'upi' | 'cash'>('upi');
  const [payRemarks, setPayRemarks] = useState('');

  useEffect(() => {
    SchoolService.getFees().then(setFees);
  }, [dataVersion]);

  const totalBilled = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalCollected = fees.reduce((sum, f) => sum + f.paid_amount, 0);
  const totalPending = totalBilled - totalCollected;
  const overdueCount = fees.filter((f) => f.status === 'overdue').length;

  const handleOpenPayment = (fee: Fee) => {
    setSelectedFee(fee);
    const balance = fee.amount - fee.paid_amount;
    setPayAmount(balance);
    setPayRemarks(`Payment via ${payMethod.toUpperCase()}`);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    try {
      await SchoolService.updateFeePayment(
        selectedFee.id,
        payAmount,
        new Date().toISOString().split('T')[0],
        payRemarks,
        currentUser
      );
      showToast(`Payment of ₹${payAmount.toLocaleString('en-IN')} recorded for ${selectedFee.student_name}!`, 'success');
      setIsPaymentModalOpen(false);
      refreshData();
    } catch (err: any) {
      showToast('Payment update failed: ' + err.message, 'error');
    }
  };

  const filteredFees = fees.filter((f) => {
    const matchesSearch =
      f.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.fee_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Fee Management & Collections</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Financial Registry
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track tuition fee invoices, recorded installments, overdue reconciliations, and receipts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => showToast('Fee statement generated & exported.', 'success')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Billed</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">₹{totalBilled.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Across enrolled cohorts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Realized Collection</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">₹{totalCollected.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {Math.round((totalCollected / (totalBilled || 1)) * 100)}% realization rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Balance</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">₹{totalPending.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Receivable dues</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Accounts</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{overdueCount} Accounts</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">Past grace window</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name or fee category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Fee Category</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Amount Paid</th>
                <th className="px-5 py-3.5">Balance Due</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredFees.map((fee) => {
                const balance = fee.amount - fee.paid_amount;

                return (
                  <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{fee.student_name}</td>
                    <td className="px-5 py-3.5 capitalize text-slate-700 font-semibold">{fee.fee_type}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">₹{fee.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 font-bold text-emerald-600">
                      ₹{fee.paid_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-bold ${balance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        ₹{balance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{fee.due_date}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={fee.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {balance > 0 ? (
                        <button
                          onClick={() => handleOpenPayment(fee)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                        >
                          Collect Payment
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Fee Payment Receipt"
        subtitle={selectedFee ? `Student: ${selectedFee.student_name} • ${selectedFee.fee_type}` : ''}
      >
        {selectedFee && (
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400">Total Invoice Amount:</span>
                <p className="font-bold text-slate-900 text-sm">₹{selectedFee.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Outstanding Balance:</span>
                <p className="font-bold text-rose-600 text-sm">
                  ₹{(selectedFee.amount - selectedFee.paid_amount).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                min={1}
                max={selectedFee.amount - selectedFee.paid_amount}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="upi">UPI / QR Code</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="bank_transfer">Net Banking / NEFT</option>
                  <option value="cash">Cash Counter Receipt</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Receipt Remarks</label>
                <input
                  type="text"
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Payment & Generate Receipt
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
