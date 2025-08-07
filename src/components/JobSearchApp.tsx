import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, DollarSign, Building, Calendar, ExternalLink, 
  Loader2, AlertCircle, Users, Clock 
} from 'lucide-react';
import '../styles/JobSearchApp.css';

interface Job {
  job_id: string;
  employer_name: string;
  job_title: string;
  job_description: string;
  job_apply_link: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_employment_type: string;
  job_posted_at_datetime_utc: string;
  job_salary_min: number;
  job_salary_max: number;
  job_salary_currency: string;
  job_benefits: string[];
  job_required_skills: string[];
  job_highlights: {
    Qualifications: string[];
    Responsibilities: string[];
    Benefits: string[];
  };
}

interface JobDetails extends Job {
  job_description_html: string;
  job_google_link: string;
  job_offer_expiration_datetime_utc: string;
  job_required_experience: {
    no_experience_required: boolean;
    required_experience_in_months: number;
    experience_mentioned: boolean;
    experience_preferred: boolean;
  };
}

const API_KEY = '8b3794ddb1msh97fb1a307bd5b83p1c2625jsn58f5c00c04d3';
const BASE_URL = 'https://jsearch.p.rapidapi.com';

const JobSearchApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Job Search States
  const [searchQuery, setSearchQuery] = useState('developer jobs in kerala');
  const [jobs, setJobs] = useState<Job[]>([]);
  const currentPage = 1;
  
  // Job Details States
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  

  const makeAPIRequest = async (endpoint: string, params: Record<string, string>) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  const searchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await makeAPIRequest('/search', {
        query: searchQuery,
        page: currentPage.toString(),
        num_pages: '1',
        country: 'in',
        date_posted: 'all'
      });
      setJobs(data.data || []);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getJobDetails = async () => {
    if (!selectedJobId) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await makeAPIRequest('/job-details', {
        job_id: selectedJobId,
        country: 'us'
      });
      setJobDetails(data.data[0] || null);
    } catch (err) {
      setError('Failed to fetch job details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return 'Not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    return formatter.format(min || max);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (activeTab === 'search') {
      searchJobs();
    }
  }, [currentPage]);

  return (
    <div className="app-container">
      <div className="app-wrapper">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">JobHub</h1>
          <p className="header-subtitle">Your comprehensive job search companion</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle className="alert-icon" />
            <span className="alert-text">{error}</span>
          </div>
        )}

        <div className="tabs-container">
          <div className="tabs-list">
            <button
              className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <Search className="tab-icon" />
              Job Search
            </button>
            <button
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <ExternalLink className="tab-icon" />
              Job Details
            </button>
          
          </div>

          {/* Job Search Tab */}
          {activeTab === 'search' && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <Search className="card-title-icon" />
                    Search Jobs
                  </h2>
                  <p className="card-description">
                    Find your dream job with our comprehensive search
                  </p>
                </div>
                <div className="card-content">
                  <div className="search-container">
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., developer jobs in chicago"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                      className="button button-primary"
                      onClick={searchJobs} 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="button-icon animate-spin" />
                      ) : (
                        <Search className="button-icon" />
                      )}
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Results */}
              {jobs.length > 0 && (
                <div className="jobs-grid">
                  {jobs.map((job) => (
                    <div key={job.job_id} className="card job-card">
                      <div className="card-header">
                        <h3 className="job-title">{job.job_title}</h3>
                        <p className="job-company">
                          <Building className="inline-icon" />
                          {job.employer_name}
                        </p>
                      </div>
                      <div className="card-content">
                        <div className="job-details">
                          <div className="job-detail-item">
                            <MapPin className="detail-icon" />
                            {job.job_city}, {job.job_state}
                          </div>
                          
                          <div className="job-detail-item">
                            <DollarSign className="detail-icon" />
                            {formatSalary(job.job_salary_min, job.job_salary_max, job.job_salary_currency)}
                          </div>
                          
                          <div className="job-detail-item">
                            <Calendar className="detail-icon" />
                            {formatDate(job.job_posted_at_datetime_utc)}
                          </div>
                          
                          <span className="badge">{job.job_employment_type}</span>
                          
                          <p className="job-description">
                            {job.job_description}
                          </p>
                        </div>
                      </div>
                      <div className="card-footer">
                        <a 
                          href={job.job_apply_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="button button-primary button-sm"
                        >
                          Apply Now
                        </a>
                        <button 
                          className="button button-outline button-sm"
                          onClick={() => {
                            setSelectedJobId(job.job_id);
                            setActiveTab('details');
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Job Details Tab */}
          {activeTab === 'details' && (
            <div className="tab-content">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    <ExternalLink className="card-title-icon" />
                    Job Details
                  </h2>
                  <p className="card-description">
                    Get detailed information about a specific job
                  </p>
                </div>
                <div className="card-content">
                  <div className="search-container">
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter job ID"
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                    />
                    <button 
                      className="button button-primary"
                      onClick={getJobDetails} 
                      disabled={loading || !selectedJobId}
                    >
                      {loading ? (
                        <Loader2 className="button-icon animate-spin" />
                      ) : (
                        <ExternalLink className="button-icon" />
                      )}
                      Get Details
                    </button>
                  </div>
                </div>
              </div>

              {jobDetails && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">{jobDetails.job_title}</h2>
                    <div className="job-meta">
                      <span className="meta-item">
                        <Building className="inline-icon" />
                        {jobDetails.employer_name}
                      </span>
                      <span className="meta-item">
                        <MapPin className="inline-icon" />
                        {jobDetails.job_city}, {jobDetails.job_state}
                      </span>

                                          </div>
                  </div>
                  <div className="card-content">
                    <div className="details-grid">
                      <div className="details-section">
                        <h3 className="section-title">Job Information</h3>
                        <div className="details-list">
                          <div className="detail-row">
                            <DollarSign className="detail-icon" />
                            <span>{formatSalary(jobDetails.job_salary_min, jobDetails.job_salary_max, jobDetails.job_salary_currency)}</span>
                          </div>
                          <div className="detail-row">
                            <Users className="detail-icon" />
                            <span className="badge">{jobDetails.job_employment_type}</span>
                          </div>
                          <div className="detail-row">
                            <Calendar className="detail-icon" />
                            <span>Posted: {formatDate(jobDetails.job_posted_at_datetime_utc)}</span>
                          </div>
                          <div className="detail-row">
                            <Clock className="detail-icon" />
                            <span>Experience: {jobDetails.job_required_experience?.required_experience_in_months ? 
                              `${Math.floor(jobDetails.job_required_experience.required_experience_in_months / 12)} years` : 
                              'Not specified'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="details-section">
                        <h3 className="section-title">Quick Actions</h3>
                        <div className="actions-container">
                          <a 
                            href={jobDetails.job_apply_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="button button-primary button-full"
                          >
                            Apply Now
                          </a>
                          {jobDetails.job_google_link && (
                            <a 
                              href={jobDetails.job_google_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="button button-outline button-full"
                            >
                              View on Google Jobs
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {jobDetails.job_highlights && (
                      <div className="highlights-section">
                        {jobDetails.job_highlights.Qualifications && (
                          <div className="highlight-block">
                            <h3 className="section-title">Qualifications</h3>
                            <ul className="highlight-list">
                              {jobDetails.job_highlights.Qualifications.map((qual, index) => (
                                <li key={index}>{qual}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {jobDetails.job_highlights.Responsibilities && (
                          <div className="highlight-block">
                            <h3 className="section-title">Responsibilities</h3>
                            <ul className="highlight-list">
                              {jobDetails.job_highlights.Responsibilities.map((resp, index) => (
                                <li key={index}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {jobDetails.job_highlights.Benefits && (
                          <div className="highlight-block">
                            <h3 className="section-title">Benefits</h3>
                            <ul className="highlight-list">
                              {jobDetails.job_highlights.Benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="description-section">
                      <h3 className="section-title">Job Description</h3>
                      <p className="description-text">{jobDetails.job_description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

     
        </div>
      </div>
    </div>
  );
};

export default JobSearchApp;