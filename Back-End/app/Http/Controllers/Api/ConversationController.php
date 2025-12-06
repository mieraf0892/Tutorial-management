<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\User;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    // Get all conversations for the current user
    public function index()
    {
        $userId = Auth::id();

        $conversations = Conversation::where('user_one', $userId)
            ->orWhere('user_two', $userId)
            ->with(['messages' => function($q){
                $q->latest()->first();
            }])
            ->get();

        return response()->json([
            'success' => true,
            'conversations' => $conversations
        ]);
    }

    // Start a conversation with another user
    public function start(Request $request)
    {
        $request->validate([
            'other_user_id' => 'required|exists:users,id',
        ]);

        $userId = Auth::id();
        $otherUserId = $request->other_user_id;

        // Prevent duplicate conversations
        $conversation = Conversation::where(function ($q) use ($userId, $otherUserId) {
                $q->where('user_one', $userId)->where('user_two', $otherUserId);
            })
            ->orWhere(function ($q) use ($userId, $otherUserId) {
                $q->where('user_one', $otherUserId)->where('user_two', $userId);
            })
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_one' => $userId,
                'user_two' => $otherUserId,
            ]);
        }

        return response()->json([
            'success' => true,
            'conversation' => $conversation
        ]);
    }
}
