<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CheckDatabaseStructure extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-db {table? : Table name to check}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check database structure for specific tables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tableName = $this->argument('table');
        
        if ($tableName) {
            $this->checkTable($tableName);
        } else {
            // Check key tables related to notifications
            $this->checkTable('projects');
            $this->checkTable('tasks');
            $this->checkTable('users');
            $this->checkTable('notifications');
        }
        
        return Command::SUCCESS;
    }
    
    private function checkTable($tableName)
    {
        $this->info("\nTable: {$tableName}");
        $this->info(str_repeat('-', strlen($tableName) + 7));
        
        if (!Schema::hasTable($tableName)) {
            $this->error("Table '{$tableName}' does not exist!");
            return;
        }
        
        // Get columns
        $columns = DB::select("SHOW COLUMNS FROM {$tableName}");
        
        $this->info("Columns:");
        foreach ($columns as $column) {
            $this->line("- {$column->Field}: {$column->Type} " . 
                    ($column->Null === 'NO' ? '(NOT NULL)' : '(NULL)') . 
                    ($column->Key === 'PRI' ? ' (PRIMARY KEY)' : '') .
                    ($column->Extra ? " [{$column->Extra}]" : ''));
        }
        
        // Sample data (first row)
        $data = DB::table($tableName)->first();
        
        if ($data) {
            $this->info("\nSample record:");
            foreach ((array)$data as $field => $value) {
                $this->line("- {$field}: " . (is_null($value) ? 'NULL' : $value));
            }
        } else {
            $this->warn("No data in table '{$tableName}'");
        }
        
        // Count records
        $count = DB::table($tableName)->count();
        $this->info("\nTotal records: {$count}");
    }
}
