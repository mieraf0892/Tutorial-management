<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendAnnouncementJob;
use App\Models\Announcement;
use App\Models\AnnouncementTemplate;
use App\Models\Attendance;
use App\Models\Message;
use App\Models\Student;
use App\Models\Tutor;
use App\Models\Tutorial;
use App\Models\TutorialSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Get comprehensive admin dashboard data.
     */
    public function dashboard(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $stats = [
                'total_users' => User::count(),
                'total_students' => User::where('role', 'student')->count(),
                'total_tutors' => User::where('role', 'tutor')->count(),
                'pending_verifications' => User::where('role', 'tutor')
                    ->where('status', 'pending')
                    ->count(),
                'pending_reports' => TutorialSession::where('status', 'completed')
                    ->whereDoesntHave('attendances')
                    ->count(),
                'total_classes' => Tutorial::count(),
                'active_classes' => Tutorial::where('is_published', true)->count(),
                'recent_attendance_count' => Attendance::whereDate('created_at', today())->count(),
            ];

            $recentActivities = User::with(['student', 'tutor'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($user) {
                    $action = 'Registered as ' . $user->role;

                    if ($user->role === 'tutor' && $user->status === 'pending') {
                        $action .= ' (Pending Approval)';
                    }

                    return [
                        'id' => $user->id,
                        'user' => $user->name,
                        'action' => $action,
                        'time' => $user->created_at->diffForHumans(),
                        'type' => $user->role,
                        'status' => $user->status,
                    ];
                });

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'recent_activities' => $recentActivities,
            ]);
        } catch (\Exception $e) {
            Log::error('Admin dashboard error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new user.
     */
    public function createUser(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'phone' => 'nullable|string|max:20',
                'role' => 'required|in:student,tutor,admin',
                'password' => 'required|string|min:8',
                'notes' => 'nullable|string|max:1000',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'role' => $validated['role'],
                'password' => Hash::make($validated['password']),
                'status' => 'active',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('Create user error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update user information.
     */
    public function updateUser(Request $request, $userId)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $user = User::findOrFail($userId);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'role' => 'sometimes|in:student,tutor,admin',
                'status' => 'sometimes|in:active,suspended,pending',
                'notes' => 'nullable|string|max:1000',
            ]);

            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            Log::error('Update user error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete user (soft delete).
     */
    public function deleteUser(Request $request, $userId)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $user = User::findOrFail($userId);
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Delete user error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Suspend a user.
     */
    public function suspendUser(Request $request, User $user)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
                return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
            }

            if ($user->id === $request->user()->id) {
                return response()->json(['success' => false, 'message' => 'You cannot suspend your own account'], 400);
            }

            if (in_array($user->role, ['admin', 'super_admin']) && !$request->user()->isSuperAdmin()) {
                return response()->json(['success' => false, 'message' => 'Only super admin can suspend other admins'], 403);
            }

            $user->update([
                'status' => 'suspended',
                'suspended_at' => now(),
            ]);

            $user->refresh();

            Log::info('User suspended', [
                'admin_id' => $request->user()->id,
                'suspended_user_id' => $user->id,
                'status' => $user->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User suspended successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'role' => $user->role,
                    'suspended_at' => $user->suspended_at,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Suspend user error: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to suspend user', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Activate a user.
     */
    public function activateUser(Request $request, User $user)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
                return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
            }

            $user->update([
                'status' => 'active',
                'suspended_at' => null,
            ]);

            $user->refresh();

            Log::info('User activated', [
                'admin_id' => $request->user()->id,
                'activated_user_id' => $user->id,
                'status' => $user->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User activated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'role' => $user->role,
                    'suspended_at' => $user->suspended_at,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Activate user error: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to activate user', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Toggle user status between active and suspended.
     */
    public function toggleUserStatus(Request $request, User $user)
    {
        try {
            if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
                return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
            }

            $newStatus = $user->status === 'active' ? 'suspended' : 'active';
            $user->update([
                'status' => $newStatus,
                'suspended_at' => $newStatus === 'suspended' ? now() : null,
            ]);

            $user->refresh();

            $action = $newStatus === 'suspended' ? 'suspended' : 'activated';
            Log::info('User status toggled', [
                'admin_id' => $request->user()->id,
                'user_id' => $user->id,
                'action' => $action,
            ]);

            return response()->json([
                'success' => true,
                'message' => "User {$action} successfully",
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'role' => $user->role,
                    'suspended_at' => $user->suspended_at,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Toggle user status error: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to toggle user status', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all users with pagination and search.
     */
    public function users(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $query = User::with(['student', 'tutor']);

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->has('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }

            $users = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            Log::info('Admin users fetch - User statuses:', [
                'users_count' => $users->count(),
                'user_statuses' => $users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'status' => $user->status,
                    ];
                })->toArray(),
            ]);

            return response()->json([
                'success' => true,
                'users' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'total_pages' => $users->lastPage(),
                    'total_items' => $users->total(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Admin users error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create an announcement.
     */
    public function createAnnouncement(Request $request)
    {
        try {
            $admin = $request->user();

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'message' => 'required|string|max:2000',
                'priority' => 'required|in:low,normal,high,urgent',
                'target_type' => 'required|in:all,roles,specific,filtered',
                'target_roles' => 'nullable|array',
                'target_users' => 'nullable|array',
                'target_users.*' => 'exists:users,id',
                'target_filters' => 'nullable|array',
                'send_at' => 'nullable|date|after:now',
                'template_id' => 'nullable|exists:announcement_templates,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $estimatedRecipients = $this->calculateRecipientCount($request->all());

            $announcement = Announcement::create([
                'admin_id' => $admin->id,
                'title' => $request->title,
                'message' => $request->message,
                'priority' => $request->priority,
                'target_type' => $request->target_type,
                'target_roles' => $request->target_roles,
                'target_users' => $request->target_users,
                'target_filters' => $request->target_filters,
                'send_at' => $request->send_at,
                'estimated_recipients' => $estimatedRecipients,
            ]);

            if ($request->template_id) {
                $template = AnnouncementTemplate::find($request->template_id);
                $template->recordUsage($admin->id);
            }

            if (!$request->send_at) {
                SendAnnouncementJob::dispatch($announcement);
            }

            return response()->json([
                'success' => true,
                'message' => $request->send_at ? 'Announcement scheduled' : 'Announcement sent',
                'data' => $announcement->load('admin'),
            ]);
        } catch (\Exception $e) {
            Log::error('Create announcement error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create announcement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate how many users will receive this announcement.
     */
    public function calculateRecipientCount($data)
    {
        $query = User::query();

        switch ($data['target_type']) {
            case 'all':
                $query->where('status', 'active');
                break;

            case 'roles':
                $roles = $data['target_roles'] ?? [];
                $query->whereIn('role', $roles)->where('status', 'active');
                break;

            case 'specific':
                $userIds = $data['target_users'] ?? [];
                $query->whereIn('id', $userIds);
                break;

            case 'filtered':
                $filters = $data['target_filters'] ?? [];
                $query = $this->applyFilters($query, $filters);
                break;
        }

        return $query->count();
    }

    /**
     * Get user count by filters (for real-time counting).
     */
    public function getUserCountByFilters(Request $request)
    {
        try {
            $data = $request->validate([
                'target_type' => 'required|in:all,roles,specific,filtered',
                'target_roles' => 'nullable|array',
                'target_users' => 'nullable|array',
                'target_users.*' => 'exists:users,id',
                'target_filters' => 'nullable|array',
            ]);

            $count = $this->calculateRecipientCount($data);

            return response()->json([
                'success' => true,
                'count' => $count,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate user count',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all announcement templates.
     */
    public function getTemplates(Request $request)
    {
        try {
            $templates = AnnouncementTemplate::orderBy('usage_count', 'desc')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $templates,
            ]);
        } catch (\Exception $e) {
            Log::error('Get templates error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch templates',
            ], 500);
        }
    }

    /**
     * Create a new announcement template.
     */
    public function createTemplate(Request $request)
    {
        try {
            $admin = $request->user();

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:announcement_templates,name',
                'title' => 'required|string|max:255',
                'message' => 'required|string|max:2000',
                'suggested_target_type' => 'nullable|in:all,roles,specific,filtered',
                'suggested_priority' => 'nullable|in:low,normal,high,urgent',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $template = AnnouncementTemplate::create([
                'name' => $request->name,
                'title' => $request->title,
                'message' => $request->message,
                'suggested_target_type' => $request->suggested_target_type ?? 'all',
                'suggested_priority' => $request->suggested_priority ?? 'normal',
                'created_by' => $admin->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Template created successfully',
                'data' => $template,
            ]);
        } catch (\Exception $e) {
            Log::error('Create template error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create template',
            ], 500);
        }
    }

    /**
     * Get announcement history.
     */
    public function getAnnouncements(Request $request)
    {
        try {
            $announcements = Announcement::with('admin')
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $announcements,
            ]);
        } catch (\Exception $e) {
            Log::error('Get announcements error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch announcements',
            ], 500);
        }
    }

    /**
     * Apply filters to user query.
     */
    private function applyFilters($query, $filters)
    {
        foreach ($filters as $key => $value) {
            if (empty($value)) {
                continue;
            }

            switch ($key) {
                case 'status':
                    $query->where('status', $value);
                    break;

                case 'roles':
                    $query->whereIn('role', (array)$value);
                    break;

                case 'join_date_after':
                    $query->where('created_at', '>=', $value);
                    break;

                case 'join_date_before':
                    $query->where('created_at', '<=', $value);
                    break;

                case 'last_active_after':
                    $query->where('last_login_at', '>=', $value);
                    break;

                case 'has_classes':
                    if ($value === 'yes') {
                        $query->where('classes', '>', 0);
                    } elseif ($value === 'no') {
                        $query->where('classes', 0);
                    }
                    break;
            }
        }

        return $query;
    }

    /**
     * Get pending tutor applications.
     */
    public function pendingTutors(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $pendingTutors = User::with(['tutor', 'tutor.subjects'])
                ->where('role', 'tutor')
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    $tutor = $user->tutor;

                    return [
                        'id' => $tutor->id,
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'qualification' => $tutor->qualification,
                        'experience_years' => $tutor->experience_years,
                        'subjects' => $tutor->subjects->pluck('subject_name')->toArray(),
                        'submitted_at' => $user->created_at->toISOString(),
                        'status' => $user->status,
                        'phone' => $user->phone,
                        'age' => $tutor->age,
                        'country' => $tutor->country,
                        'city' => $tutor->city,
                        'bio' => $tutor->bio,
                        'hourly_rate' => $tutor->hourly_rate,
                        'address' => $tutor->address,
                        'degree_photo' => $tutor->degree_photo,
                        'degree_photo_url' => $tutor->degree_photo ? url('storage/' . $tutor->degree_photo) : null,
                        'degree_verified' => $tutor->degree_verified,
                        'rejection_reason' => $tutor->rejection_reason,
                    ];
                });

            return response()->json([
                'success' => true,
                'tutors' => $pendingTutors,
            ]);
        } catch (\Exception $e) {
            Log::error('Admin pending tutors error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending tutors',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve tutor application.
     */
    public function approveTutor(Request $request, $tutorId)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        DB::beginTransaction();

        try {
            $tutor = Tutor::findOrFail($tutorId);
            $user = $tutor->user;

            if (!$user) {
                throw new \Exception('User not found for this tutor');
            }

            $user->status = 'active';
            $user->save();

            $tutor->is_verified = true;
            $tutor->save();

            $this->sendTutorApprovalEmail($user, true);

            Log::info('Tutor approved by admin', [
                'admin_id' => $request->user()->id,
                'admin_name' => $request->user()->name,
                'tutor_id' => $tutor->id,
                'tutor_name' => $user->name,
                'approved_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tutor approved successfully. Notification email sent.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Approve tutor error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve tutor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send tutor approval/rejection email.
     */
    private function sendTutorApprovalEmail($user, $isApproved = true, $reason = null)
    {
        try {
            $emailData = [
                'user' => $user,
                'isApproved' => $isApproved,
                'reason' => $reason,
            ];

            Mail::send($isApproved ? 'emails.tutor_approval' : 'emails.tutor_rejection', $emailData, function ($message) use ($user, $isApproved) {
                $message->to($user->email)
                    ->subject($isApproved ? '🎉 Your Tutor Application Has Been Approved!' : '❌ Your Tutor Application Status');
            });

            Log::info('Tutor approval email sent', [
                'tutor_id' => $user->id,
                'tutor_email' => $user->email,
                'status' => $isApproved ? 'approved' : 'rejected',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send tutor approval email: ' . $e->getMessage());
        }
    }

    /**
     * Reject tutor application.
     */
    public function rejectTutor(Request $request, $tutorId)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|min:10|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            $tutor = Tutor::findOrFail($tutorId);
            $user = $tutor->user;

            if (!$user) {
                throw new \Exception('User not found for this tutor');
            }

            $user->status = 'rejected';
            $user->save();

            $tutor->rejection_reason = $request->rejection_reason;
            $tutor->save();

            $this->sendTutorApprovalEmail($user, false, $request->rejection_reason);

            Log::info('Tutor rejected by admin', [
                'admin_id' => $request->user()->id,
                'admin_name' => $request->user()->name,
                'tutor_id' => $tutor->id,
                'tutor_name' => $user->name,
                'rejection_reason' => $request->rejection_reason,
                'rejected_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tutor application rejected. Notification email sent.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Reject tutor error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject tutor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get pending session reports.
     */
    public function pendingReports(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $pendingReports = TutorialSession::with([
                'tutorial.enrollments',
                'attendances',
            ])
                ->with(['tutor' => function ($query) {
                    $query->select('id', 'name');
                }])
                ->where('status', 'completed')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($session) {
                    $tutorName = $session->tutor ? $session->tutor->name : 'Unknown Tutor';
                    $totalStudents = $session->tutorial ? $session->tutorial->enrollments->count() : 0;
                    $studentsPresent = $session->attendances->where('status', 'present')->count();

                    return [
                        'id' => $session->id,
                        'session_id' => $session->id,
                        'tutor_name' => $tutorName,
                        'session_title' => $session->title,
                        'session_date' => $session->start_time->toISOString(),
                        'students_present' => $studentsPresent,
                        'total_students' => $totalStudents,
                        'submitted_at' => $session->updated_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'reports' => $pendingReports,
            ]);
        } catch (\Exception $e) {
            Log::error('Admin pending reports error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending reports',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get attendance records with filters.
     */
    public function attendance(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $query = Attendance::with(['user', 'tutorial', 'tutorialSession']);

            if ($request->has('tutorial_id')) {
                $query->where('tutorial_id', $request->tutorial_id);
            }

            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('session_date', [
                    $request->start_date,
                    $request->end_date,
                ]);
            }

            $attendance = $query->orderBy('session_date', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'attendance' => $attendance->items(),
                'pagination' => [
                    'current_page' => $attendance->currentPage(),
                    'total_pages' => $attendance->lastPage(),
                    'total_items' => $attendance->total(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Admin attendance error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance records',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function classes(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $query = Tutorial::with([
                'tutor' => function($q) {
                    $q->select('id', 'name', 'email', 'role');
                    },
                'category' => function($q) {
                    $q->select('id', 'name', 'color');
                },
                'enrollments'
            ]);

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('tutor', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                });
            }

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $query->where('is_published', true);
                } elseif ($request->status === 'archived') {
                    $query->where('is_published', false);
                }
            }

            $classes = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 12));

            $formattedClasses = $classes->map(function ($class) {
                $enrollmentCount = $class->enrollments->where('status', 'active')->count();
                $completionCount = $class->enrollments->where('status', 'completed')->count();
                $totalEnrollments = $class->enrollments->count();
            
                $completionRate = $totalEnrollments > 0 
                    ? round(($completionCount / $totalEnrollments) * 100) 
                    : 0;

                return [
                    'id' => $class->id,
                    'title' => $class->title,
                    'name' => $class->title, // For compatibility with frontend
                    'description' => $class->description,
                    'tutor' => $class->tutor ? $class->tutor->name : 'Unknown Tutor',
                    'tutor_details' => $class->tutor ? [
                        'id' => $class->tutor->id,
                        'name' => $class->tutor->name,
                        'email' => $class->tutor->email
                    ] : null,
                    'students' => $enrollmentCount,
                    'max_capacity' => 30, // You can add this field to tutorials table
                    'rating' => (float) $class->rating,
                    'subject' => $class->category ? $class->category->name : 'General',
                    'category' => $class->category ? [
                        'id' => $class->category->id,
                        'name' => $class->category->name,
                        'color' => $class->category->color
                    ] : null,
                    'color' => $class->category && $class->category->color 
                        ? 'bg-' . str_replace('#', '', $class->category->color) . '-500'
                        : 'bg-blue-500',
                    'enrollmentCode' => 'CLASS-' . str_pad($class->id, 6, '0', STR_PAD_LEFT),
                    'assignments' => $class->lessons, // From tutorials.lessons field
                    'active' => (bool) $class->is_published,
                    'completionRate' => $completionRate,
                    'duration' => $class->duration,
                    'level' => $class->level,
                    'price' => $class->price,
                    'created_at' => $class->created_at->toISOString(),
                    'updated_at' => $class->updated_at->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'classes' => $formattedClasses,
                'pagination' => [
                    'current_page' => $classes->currentPage(),
                    'total_pages' => $classes->lastPage(),
                    'total_items' => $classes->total(),
                    'per_page' => $classes->perPage(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Admin classes error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch classes',
                'error' => $e->getMessage(),
            ], 500);
        }   
    }

    /**
 * Create a new class/tutorial.
 */
public function createClass(Request $request)
{
    if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
        return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
    }

    $validator = Validator::make($request->all(), [
        'title' => 'required|string|max:255',
        'description' => 'required|string',
        'tutor_id' => 'required|exists:users,id',
        'category_id' => 'required|exists:categories,id',
        'duration' => 'required|string|max:50',
        'level' => 'required|in:Beginner,Intermediate,Advanced',
        'price' => 'required|numeric|min:0',
        'learning_objectives' => 'nullable|array',
        'includes' => 'nullable|array',
        'image' => 'nullable|string|url',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    DB::beginTransaction();
    try {
        $tutor = User::findOrFail($request->tutor_id);
        
        if ($tutor->role !== 'tutor') {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a tutor',
            ], 422);
        }

        $class = Tutorial::create([
            'tutor_id' => $tutor->id,
            'title' => $request->title,
            'description' => $request->description,
            'category_id' => $request->category_id,
            'duration' => $request->duration,
            'level' => $request->level,
            'price' => $request->price,
            'instructor' => $tutor->name,
            'learning_objectives' => $request->learning_objectives,
            'includes' => $request->includes,
            'image' => $request->image ?? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
            'is_published' => $request->boolean('is_published', true),
        ]);

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Class created successfully',
            'class' => $class->load(['tutor', 'category']),
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Create class error: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to create class',
            'error' => $e->getMessage(),
        ], 500);
    }
}

/**
 * Update a class/tutorial.
 */
public function updateClass(Request $request, $id)
{
    if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
        return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
    }

    $validator = Validator::make($request->all(), [
        'title' => 'sometimes|string|max:255',
        'description' => 'sometimes|string',
        'tutor_id' => 'sometimes|exists:users,id',
        'category_id' => 'sometimes|exists:categories,id',
        'duration' => 'sometimes|string|max:50',
        'level' => 'sometimes|in:Beginner,Intermediate,Advanced',
        'price' => 'sometimes|numeric|min:0',
        'learning_objectives' => 'nullable|array',
        'includes' => 'nullable|array',
        'is_published' => 'sometimes|boolean',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    try {
        $class = Tutorial::findOrFail($id);
        
        $updateData = $request->only([
            'title', 'description', 'category_id', 'duration', 
            'level', 'price', 'learning_objectives', 'includes', 'is_published'
        ]);
        
        if ($request->has('tutor_id')) {
            $tutor = User::findOrFail($request->tutor_id);
            if ($tutor->role !== 'tutor') {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected user is not a tutor',
                ], 422);
            }
            $updateData['tutor_id'] = $tutor->id;
            $updateData['instructor'] = $tutor->name;
        }
        
        $class->update($updateData);
        
        return response()->json([
            'success' => true,
            'message' => 'Class updated successfully',
            'class' => $class->load(['tutor', 'category']),
        ]);
    } catch (\Exception $e) {
        Log::error('Update class error: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to update class',
            'error' => $e->getMessage(),
        ], 500);
    }
}

/**
 * Delete/Archive a class.
 */
public function deleteClass(Request $request, $id)
{
    if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
        return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
    }

    try {
        $class = Tutorial::findOrFail($id);
        
        // Instead of deleting, we can archive it
        $class->update(['is_published' => false]);
        
        return response()->json([
            'success' => true,
            'message' => 'Class archived successfully',
        ]);
    } catch (\Exception $e) {
        Log::error('Delete class error: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to archive class',
            'error' => $e->getMessage(),
        ], 500);
    }
}

/**
 * Get class details with enrolled students.
 */
public function getClassDetails(Request $request, $id)
{
    if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
        return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
    }

    try {
        $class = Tutorial::with([
            'tutor',
            'category',
            'enrollments.user.student',
            'tutorialSessions',
            'lessons'
        ])->findOrFail($id);
        
        $activeStudents = $class->enrollments()
            ->where('status', 'active')
            ->with('user')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->user->id,
                    'name' => $enrollment->user->name,
                    'email' => $enrollment->user->email,
                    'enrolled_at' => $enrollment->created_at->toISOString(),
                    'status' => $enrollment->status,
                ];
            });
        
        return response()->json([
            'success' => true,
            'class' => $class,
            'students' => $activeStudents,
            'total_students' => $activeStudents->count(),
            'sessions_count' => $class->tutorialSessions->count(),
            'lessons_count' => $class->lessons->count(),
        ]);
    } catch (\Exception $e) {
        Log::error('Get class details error: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch class details',
            'error' => $e->getMessage(),
        ], 500);
    }
}   

/**
 * Get students enrolled in a class.
 */
public function getClassStudents(Request $request, $id)
{
    if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
        return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
    }

    try {
        $class = Tutorial::findOrFail($id);
        
        $query = $class->enrollments()->with('user');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        $students = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));
        
        $formattedStudents = $students->map(function ($enrollment) {
            return [
                'id' => $enrollment->user->id,
                'name' => $enrollment->user->name,
                'email' => $enrollment->user->email,
                'role' => $enrollment->user->role,
                'enrollment_id' => $enrollment->id,
                'enrolled_at' => $enrollment->created_at->toISOString(),
                'status' => $enrollment->status,
                'completed_at' => $enrollment->completed_at,
            ];
        });
        
        return response()->json([
            'success' => true,
            'students' => $formattedStudents,
            'class' => [
                'id' => $class->id,
                'title' => $class->title,
                'total_students' => $class->enrollments()->count(),
            ],
            'pagination' => [
                'current_page' => $students->currentPage(),
                'total_pages' => $students->lastPage(),
                'total_items' => $students->total(),
                'per_page' => $students->perPage(),
            ],
        ]);
    } catch (\Exception $e) {
        Log::error('Get class students error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch class students',
            'error' => $e->getMessage(),
        ], 500);
    }
}

/**
 * Enroll a student in a class.
 */
public function enrollStudent(Request $request, $id)
{
    if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
        return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
    }
    
    $validator = Validator::make($request->all(), [
        'student_id' => 'required|exists:users,id',
        'status' => 'sometimes|in:active,completed,cancelled',
    ]);
    
    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }
    
    try {
        $class = Tutorial::findOrFail($id);
        $student = User::findOrFail($request->student_id);
        
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a student',
            ], 422);
        }
        
        // Check if already enrolled
        $existingEnrollment = $class->enrollments()
            ->where('user_id', $student->id)
            ->first();
            
        if ($existingEnrollment) {
            return response()->json([
                'success' => false,
                'message' => 'Student is already enrolled in this class',
            ], 422);
        }
        
        $enrollment = $class->enrollments()->create([
            'user_id' => $student->id,
            'status' => $request->status ?? 'active',
        ]);
        
        // Update students count in tutorial
        $class->increment('students');
        
        return response()->json([
            'success' => true,
            'message' => 'Student enrolled successfully',
            'enrollment' => $enrollment->load('user'),
        ]);
    } catch (\Exception $e) {
        Log::error('Enroll student error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to enroll student',
            'error' => $e->getMessage(),
        ], 500);
    }
}

/**
 * Remove a student from a class.
 */
public function removeStudent(Request $request, $id, $studentId)
{
    if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
        return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
    }
    
    try {
        $class = Tutorial::findOrFail($id);
        
        $enrollment = $class->enrollments()
            ->where('user_id', $studentId)
            ->firstOrFail();
            
        $enrollment->delete();
        
        // Update students count in tutorial
        $class->decrement('students');
        
        return response()->json([
            'success' => true,
            'message' => 'Student removed from class successfully',
        ]);
    } catch (\Exception $e) {
        Log::error('Remove student error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to remove student',
            'error' => $e->getMessage(),
        ], 500);
    }
}


    /**
     * Get tutors with pending degree verification.
     */
    public function getTutorsWithPendingDegree(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $query = Tutor::with(['user', 'subjects'])
                ->where('degree_verified', 'pending')
                ->whereHas('user', function ($query) {
                    $query->where(function ($q) {
                        $q->where('status', 'active')->orWhere('status', 'pending');
                    });
                });

            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $tutors = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 10));

            $formattedTutors = $tutors->map(function ($tutor) {
                return [
                    'id' => $tutor->id,
                    'user_id' => $tutor->user_id,
                    'name' => $tutor->user->name ?? 'N/A',
                    'email' => $tutor->user->email ?? 'N/A',
                    'phone' => $tutor->phone,
                    'qualification' => $tutor->qualification,
                    'degree_photo' => $tutor->degree_photo,
                    'degree_photo_url' => $tutor->degree_photo ? url('storage/' . $tutor->degree_photo) : null,
                    'degree_verified' => $tutor->degree_verified,
                    'experience_years' => $tutor->experience_years,
                    'age' => $tutor->age,
                    'country' => $tutor->country,
                    'city' => $tutor->city,
                    'subjects' => $tutor->subjects->map(function ($subject) {
                        return $subject->subject_name;
                    })->toArray(),
                    'subjects_details' => $tutor->subjects->map(function ($subject) {
                        return [
                            'name' => $subject->subject_name,
                            'specialization' => $subject->specialization,
                            'level' => $subject->level,
                        ];
                    }),
                    'created_at' => $tutor->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $tutor->updated_at->format('Y-m-d H:i:s'),
                    'user_status' => $tutor->user->status ?? 'unknown',
                    'bio' => $tutor->bio,
                    'hourly_rate' => $tutor->hourly_rate,
                    'address' => $tutor->address,
                    'rejection_reason' => $tutor->rejection_reason,
                ];
            });

            return response()->json([
                'success' => true,
                'tutors' => $formattedTutors,
                'pagination' => [
                    'current_page' => $tutors->currentPage(),
                    'total_pages' => $tutors->lastPage(),
                    'total_items' => $tutors->total(),
                    'per_page' => $tutors->perPage(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch tutors with pending degree: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tutors with pending degree verification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve tutor's degree.
     */
    public function approveDegree(Request $request, $tutorId)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        DB::beginTransaction();

        try {
            $tutor = Tutor::with('user')->findOrFail($tutorId);

            $tutor->update([
                'degree_verified' => 'approved',
                'is_verified' => true,
            ]);

            if ($tutor->user && $tutor->user->status === 'pending') {
                $tutor->user->update(['status' => 'active']);
            }

            Log::info('Degree approved by admin', [
                'admin_id' => $request->user()->id,
                'admin_name' => $request->user()->name,
                'tutor_id' => $tutor->id,
                'tutor_name' => $tutor->user->name ?? 'N/A',
                'approved_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Degree approved successfully',
                'tutor' => [
                    'id' => $tutor->id,
                    'name' => $tutor->user->name ?? 'N/A',
                    'degree_verified' => 'approved',
                    'is_verified' => true,
                    'user_status' => $tutor->user->status ?? 'unknown',
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to approve degree: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve degree',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject tutor's degree.
     */
    public function rejectDegree(Request $request, $tutorId)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|min:10|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            $tutor = Tutor::with('user')->findOrFail($tutorId);

            $tutor->update([
                'degree_verified' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
            ]);

            if ($tutor->user) {
                $tutor->user->update([
                    'status' => 'suspended',
                    'suspended_at' => now(),
                ]);
            }

            $this->sendDegreeRejectionEmail($tutor, $request->rejection_reason);

            Log::info('Degree rejected by admin', [
                'admin_id' => $request->user()->id,
                'admin_name' => $request->user()->name,
                'tutor_id' => $tutor->id,
                'tutor_name' => $tutor->user->name ?? 'N/A',
                'rejection_reason' => $request->rejection_reason,
                'rejected_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Degree rejected successfully. Tutor has been suspended.',
                'tutor' => [
                    'id' => $tutor->id,
                    'name' => $tutor->user->name ?? 'N/A',
                    'degree_verified' => 'rejected',
                    'rejection_reason' => $request->rejection_reason,
                    'user_status' => $tutor->user->status ?? 'unknown',
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to reject degree: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject degree',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send degree rejection email.
     */
    private function sendDegreeRejectionEmail($tutor, $rejectionReason)
    {
        try {
            if (!$tutor->user || !$tutor->user->email) {
                Log::warning('Cannot send degree rejection email: Tutor or email not found', [
                    'tutor_id' => $tutor->id,
                ]);
                return;
            }

            $emailData = [
                'tutor' => $tutor,
                'user' => $tutor->user,
                'rejection_reason' => $rejectionReason,
            ];

            Mail::send('emails.degree_rejection', $emailData, function ($message) use ($tutor) {
                $message->to($tutor->user->email)
                    ->subject('❌ Degree Verification Rejected - Tutorial System');
            });

            Log::info('Degree rejection email sent', [
                'tutor_id' => $tutor->id,
                'tutor_email' => $tutor->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send degree rejection email: ' . $e->getMessage());
        }
    }

    /**
     * Get degree verification statistics.
     */
    public function getDegreeVerificationStats(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Admin access required'], 403);
        }

        try {
            $stats = [
                'total_pending' => Tutor::where('degree_verified', 'pending')->count(),
                'total_approved' => Tutor::where('degree_verified', 'approved')->count(),
                'total_rejected' => Tutor::where('degree_verified', 'rejected')->count(),
                'total_tutors_with_degree' => Tutor::whereNotNull('degree_photo')->count(),
            ];

            $recentVerifications = Tutor::with('user')
                ->whereNotNull('degree_verified')
                ->where('degree_verified', '!=', 'pending')
                ->where('updated_at', '>=', now()->subDays(7))
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($tutor) {
                    return [
                        'id' => $tutor->id,
                        'name' => $tutor->user->name ?? 'N/A',
                        'action' => ucfirst($tutor->degree_verified),
                        'time' => $tutor->updated_at->diffForHumans(),
                        'admin_action' => true,
                    ];
                });

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'recent_verifications' => $recentVerifications,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch degree verification stats: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch degree verification statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
