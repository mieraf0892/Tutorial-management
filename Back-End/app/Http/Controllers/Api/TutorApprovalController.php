<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\TutorApprovalNotification;
use Illuminate\Support\Facades\Log;

class TutorApprovalController extends Controller
{
    /**
     * Get all pending tutor registrations
     */
    public function pendingTutors(Request $request)
    {
        $query = User::where('role', 'tutor')
            ->where('status', 'pending')
            ->with('tutor', 'tutor.subjects', 'tutor.availability')
            ->latest();
            
        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        $tutors = $query->paginate(10);
        
        return response()->json([
            'success' => true,
            'tutors' => $tutors,
            'total_pending' => User::where('role', 'tutor')->where('status', 'pending')->count(),
        ]);
    }
    
    /**
     * Get tutor details for review
     */
    public function getTutorDetails($id)
    {
        $user = User::where('role', 'tutor')
            ->where('id', $id)
            ->with(['tutor', 'tutor.subjects', 'tutor.availability'])
            ->firstOrFail();
            
        return response()->json([
            'success' => true,
            'tutor' => $user,
        ]);
    }
    
    /**
     * Approve a tutor registration
     */
    public function approveTutor($id)
    {
        DB::beginTransaction();
        
        try {
            $user = User::where('role', 'tutor')
                ->where('id', $id)
                ->where('status', 'pending')
                ->firstOrFail();
                
            $tutor = $user->tutor;
            
            if (!$tutor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tutor profile not found'
                ], 404);
            }
            
            // Update user status
            $user->status = 'active';
            $user->save();
            
            // Update tutor verification status
            $tutor->is_verified = true;
            $tutor->save();
            
            // Send approval notification email
            $this->sendApprovalEmail($user);
            
            DB::commit();
            
            // Log the approval
            Log::info('Tutor approved by admin', [
                'tutor_id' => $user->id,
                'tutor_name' => $user->name,
                'approved_by' => auth()->user()->name,
                'approved_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Tutor approved successfully',
                'tutor' => $user->load('tutor'),
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve tutor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Reject a tutor registration
     */
    public function rejectTutor(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|min:10|max:500',
        ]);
        
        DB::beginTransaction();
        
        try {
            $user = User::where('role', 'tutor')
                ->where('id', $id)
                ->where('status', 'pending')
                ->firstOrFail();
                
            $tutor = $user->tutor;
            
            if (!$tutor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tutor profile not found'
                ], 404);
            }
            
            // Update user status
            $user->status = 'rejected';
            $user->save();
            
            // Store rejection reason (you might want to add a field for this)
            $tutor->rejection_reason = $request->rejection_reason;
            $tutor->save();
            
            // Send rejection notification email
            $this->sendRejectionEmail($user, $request->rejection_reason);
            
            DB::commit();
            
            // Log the rejection
            Log::info('Tutor rejected by admin', [
                'tutor_id' => $user->id,
                'tutor_name' => $user->name,
                'rejected_by' => auth()->user()->name,
                'rejection_reason' => $request->rejection_reason,
                'rejected_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Tutor registration rejected',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject tutor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get tutor approval statistics
     */
    public function approvalStats()
    {
        $stats = [
            'pending' => User::where('role', 'tutor')->where('status', 'pending')->count(),
            'approved' => User::where('role', 'tutor')->where('status', 'active')->count(),
            'rejected' => User::where('role', 'tutor')->where('status', 'rejected')->count(),
            'total' => User::where('role', 'tutor')->count(),
        ];
        
        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }
    
    /**
     * Send approval email to tutor
     */
    private function sendApprovalEmail($user)
    {
        try {
            Mail::to($user->email)->send(new TutorApprovalNotification($user, true));
            Log::info('Approval email sent to tutor: ' . $user->email);
        } catch (\Exception $e) {
            Log::error('Failed to send approval email: ' . $e->getMessage());
        }
    }
    
    /**
     * Send rejection email to tutor
     */
    private function sendRejectionEmail($user, $reason)
    {
        try {
            // You can create a separate rejection email class or use the same with different parameters
            $data = [
                'user' => $user,
                'reason' => $reason,
                'is_approved' => false,
            ];
            
            Mail::send('emails.tutor_rejection', $data, function($message) use ($user) {
                $message->to($user->email)
                        ->subject('Your Tutor Application Status');
            });
            
            Log::info('Rejection email sent to tutor: ' . $user->email);
        } catch (\Exception $e) {
            Log::error('Failed to send rejection email: ' . $e->getMessage());
        }
    }
}