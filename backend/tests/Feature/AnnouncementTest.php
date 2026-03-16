<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_see_published_announcements()
    {
        $user = User::factory()->create(['role' => 'staff']);
        Announcement::factory()->count(2)->create([
            'published_at' => now(),
            'target' => 'all'
        ]);
        Announcement::factory()->create([
            'published_at' => null, // unpublished
            'target' => 'all'
        ]);

        $response = $this->actingAs($user)->getJson('/api/announcements');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }

    public function test_role_based_announcement_visibility()
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $manager = User::factory()->create(['role' => 'manager']);

        Announcement::factory()->create([
            'target' => 'staff',
            'published_at' => now()
        ]);
        Announcement::factory()->create([
            'target' => 'manager',
            'published_at' => now()
        ]);

        $responseStaff = $this->actingAs($staff)->getJson('/api/announcements');
        $responseStaff->assertJsonCount(1, 'data');

        $responseManager = $this->actingAs($manager)->getJson('/api/announcements');
        $responseManager->assertJsonCount(1, 'data');
    }

    public function test_user_can_mark_announcement_as_read()
    {
        $user = User::factory()->create();
        $announcement = Announcement::factory()->create(['published_at' => now()]);

        $response = $this->actingAs($user)->postJson("/api/announcements/{$announcement->id}/read");

        $response->assertStatus(200);
        $this->assertDatabaseHas('announcement_reads', [
            'announcement_id' => $announcement->id,
            'user_id' => $user->id
        ]);
    }
}
