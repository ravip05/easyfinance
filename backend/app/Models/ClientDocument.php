<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ClientDocument extends Model {
    protected $fillable = ['client_id','name','type','path','size','uploaded_by'];
    public function client() { return $this->belongsTo(Client::class); }
}