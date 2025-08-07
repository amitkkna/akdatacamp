# Contributing to Campaign Profitability Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/campaign-profitability-tracker.git
   cd campaign-profitability-tracker
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

## 🔧 Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run dev
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Commit Message Convention

Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🎯 Areas for Contribution

- **UI/UX Improvements**
- **Performance Optimizations**
- **New Features**
- **Bug Fixes**
- **Documentation**
- **Testing**

## 📋 Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Tailwind CSS for styling
- Keep components small and focused
- Add proper error handling

## 🧪 Testing

- Test all new features manually
- Ensure responsive design works
- Check database operations
- Verify calculations are correct

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Update DEPLOYMENT.md if needed
- Include examples in documentation

## 🐛 Bug Reports

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Screenshots if applicable

## 💡 Feature Requests

For new features:
- Describe the use case
- Explain the expected behavior
- Consider implementation complexity
- Discuss with maintainers first

## 🔍 Code Review Process

1. All changes require review
2. Address feedback promptly
3. Keep PRs focused and small
4. Update documentation as needed
5. Ensure CI passes

## 📞 Getting Help

- Open an issue for questions
- Join discussions in PRs
- Check existing documentation
- Review similar implementations

Thank you for contributing! 🎉
