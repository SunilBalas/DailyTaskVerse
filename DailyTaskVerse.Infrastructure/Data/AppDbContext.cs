using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DailyTaskVerse.Domain.Entities;

namespace DailyTaskVerse.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<DailyLog> DailyLogs => Set<DailyLog>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AzureDevOpsSettings> AzureDevOpsSettings => Set<AzureDevOpsSettings>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.Name).HasMaxLength(200).IsRequired();
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
            entity.Property(u => u.StandupTime).HasDefaultValue(new TimeSpan(10, 0, 0));
        });

        builder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
            entity.Property(t => t.Title).HasMaxLength(500).IsRequired();
            entity.Property(t => t.Description).HasMaxLength(4000);
            entity.Property(t => t.Priority).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Category).HasMaxLength(50);
            entity.Property(t => t.RecurrencePattern).HasMaxLength(20);

            entity.HasIndex(t => t.UserId);
            entity.HasIndex(t => t.Status);

            entity.HasOne(t => t.User)
                  .WithMany(u => u.Tasks)
                  .HasForeignKey(t => t.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DailyLog>(entity =>
        {
            entity.ToTable("DailyLogs");
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
            entity.Property(d => d.Content).IsRequired();
            entity.Property(d => d.HoursSpent).HasColumnType("decimal(4,2)");
            entity.Property(d => d.LogDate).HasColumnType("date");

            entity.HasIndex(d => d.UserId);
            entity.HasIndex(d => d.LogDate);

            entity.HasOne(d => d.User)
                  .WithMany(u => u.DailyLogs)
                  .HasForeignKey(d => d.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Note>(entity =>
        {
            entity.ToTable("Notes");
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
            entity.Property(n => n.Title).HasMaxLength(200).IsRequired();
            entity.Property(n => n.Content).IsRequired();

            entity.HasIndex(n => n.UserId);

            entity.HasOne(n => n.User)
                  .WithMany(u => u.Notes)
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
            entity.Property(n => n.Title).HasMaxLength(200).IsRequired();
            entity.Property(n => n.Message).HasMaxLength(1000);
            entity.Property(n => n.Type).HasConversion<string>().HasMaxLength(20);

            entity.HasIndex(n => new { n.UserId, n.IsRead });

            entity.HasOne(n => n.User)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(n => n.Task)
                  .WithMany()
                  .HasForeignKey(n => n.TaskId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        builder.Entity<AzureDevOpsSettings>(entity =>
        {
            entity.ToTable("AzureDevOpsSettings");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).HasDefaultValueSql("NEWSEQUENTIALID()");
            entity.Property(a => a.OrganizationUrl).HasMaxLength(500).IsRequired();
            entity.Property(a => a.EncryptedPat).IsRequired();
            entity.Property(a => a.SelectedProjectIds).HasMaxLength(4000);
            entity.Property(a => a.SelectedProjectNames).HasMaxLength(4000);

            entity.HasIndex(a => a.UserId).IsUnique();

            entity.HasOne(a => a.User)
                  .WithOne(u => u.AzureDevOpsSettings)
                  .HasForeignKey<AzureDevOpsSettings>(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
