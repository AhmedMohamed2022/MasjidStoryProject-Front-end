using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ViewModels
{
    public class MasjidCreateViewModel
    {
        [Required]
        public string ShortName { get; set; } = string.Empty;
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        public string ArchStyle { get; set; } = string.Empty;
        
        public decimal? Latitude { get; set; }
        
        public decimal? Longitude { get; set; }
        
        [Required]
        public int CountryId { get; set; }
        
        public string CountryName { get; set; } = string.Empty;
        
        [Required]
        public int CityId { get; set; }
        
        public string CityName { get; set; } = string.Empty;
        
        public int? YearOfEstablishment { get; set; }
        
        public List<IFormFile>? MediaFiles { get; set; }
    }
} 