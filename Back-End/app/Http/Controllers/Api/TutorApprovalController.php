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
        // Show tutors with 'pending' status
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
        
        // Add degree photo URL
        $tutors->getCollection()->transform(function ($user) {
            if ($user->tutor && $user->tutor->degree_photo) {
                $user->tutor->degree_photo_url = url('storage/' . $user->tutor->degree_photo);
            }
            return $user;
        });
        
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
            ->where('status', 'pending')
            ->with(['tutor', 'tutor.subjects', 'tutor.availability'])
            ->firstOrFail();
            
        // Add degree photo URL
        if ($user->tutor && $user->tutor->degree_photo) {
            $user->tutor->degree_photo_url = url('storage/' . $user->tutor->degree_photo);
        }
            
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
                ->with('tutor')
                ->firstOrFail();
                
            $tutor = $user->tutor;
            
            if (!$tutor) {
                throw new \Exception('Tutor profile not found');
                return response()->json([
                    'success' => false,
                    'message' => 'Tutor profile not found'
                ], 404);
            }
            
            // Update user status to active
            $user->status = 'active';
            $user->save();
            
            // Update tutor verification status
            $tutor->is_verified = true;
            $tutor->degree_verified = 'approved';
            $tutor->save();
            
            // Send approval notification email
            $this->sendApprovalEmail($user);
            
            DB::commit();
            
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
            
            // Update user status to rejected
            $user->status = 'rejected';
            $user->save();
            
            // Store rejection reason
            $tutor->rejection_reason = $request->rejection_reason;
            $tutor->degree_verified = 'rejected';
            $tutor->save();
            
            // Send rejection notification email
            $this->sendRejectionEmail($user, $request->rejection_reason);
            
            DB::commit();
            
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
            'active' => User::where('role', 'tutor')->where('status', 'active')->count(),
            'suspended' => User::where('role', 'tutor')->where('status', 'suspended')->count(),
            'inactive' => User::where('role', 'tutor')->where('status', 'inactive')->count(),
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
        // Load tutor relation if not already loaded
        $tutor = $user->tutor ?? $user->tutor()->first();

        if (!$tutor) {
            throw new \Exception('Tutor profile missing for email');
        }

        Mail::to($user->email)->send(new \App\Mail\TutorWelcomeEmail($user, $tutor));

        Log::info('Tutor approval/welcome email sent successfully', [
            'to'       => $user->email,
            'tutor_id' => $tutor->id,
        ]);
    } catch (\Exception $e) {
        Log::error('Failed to send tutor approval/welcome email', [
            'email' => $user->email,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        // Do NOT rethrow — approval should still succeed even if email fails
    }
}
    
    /**
     * Send rejection email to tutor
     */
    private function sendRejectionEmail($user, $reason)
    {
        try {
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