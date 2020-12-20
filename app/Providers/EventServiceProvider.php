<?php

namespace App\Providers;

use App\Events\GrowthSessionAttendeeChanged;
use App\Events\GrowthSessionCreated;
use App\Events\GrowthSessionDeleted;
use App\Events\SocialMobUpdated;
use App\Listeners\NotifySocialMobAttendeeChange;
use App\Listeners\NotifySocialMobCreation;
use App\Listeners\NotifySocialMobDelete;
use App\Listeners\NotifySocialMobUpdate;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [SendEmailVerificationNotification::class],
        GrowthSessionCreated::class => [NotifySocialMobCreation::class],
        GrowthSessionAttendeeChanged::class => [NotifySocialMobAttendeeChange::class],
        SocialMobUpdated::class => [NotifySocialMobUpdate::class],
        GrowthSessionDeleted::class => [NotifySocialMobDelete::class]
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        //
    }
}
