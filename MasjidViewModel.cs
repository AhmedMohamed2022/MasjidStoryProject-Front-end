using ViewModels.Media;

namespace ViewModels
{
    public class MasjidViewModel
    {
        public int Id { get; set; }
        public string ShortName { get; set; }
        public string Address { get; set; }
        public string ArchStyle { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int CountryId { get; set; }
        public string CountryName { get; set; }
        public int CityId { get; set; }
        public string CityName { get; set; }
        public int? YearOfEstablishment { get; set; }
        public DateTime DateOfRecord { get; set; }
        public List<MediaViewModel> MediaItems { get; set; } = new List<MediaViewModel>();
    }
} 